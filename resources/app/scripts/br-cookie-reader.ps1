param(
  [Parameter(Mandatory=$true)]
  [string]$Database
)

$ErrorActionPreference = 'Stop'

try {
  if (-not (Test-Path -LiteralPath $Database -PathType Leaf)) {
    throw 'COOKIE_DB_NOT_FOUND'
  }

  $wal = $Database + '-wal'
  if ((Test-Path -LiteralPath $wal -PathType Leaf) -and (Get-Item -LiteralPath $wal).Length -gt 32) {
    throw 'COOKIE_DB_WAL_NOT_CHECKPOINTED'
  }

  $source = @'
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

public static class BrCookieSqliteReader {
    private const int SQLITE_OK = 0;
    private const int SQLITE_ROW = 100;
    private const int SQLITE_DONE = 101;
    private const int SQLITE_OPEN_READONLY = 0x00000001;

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int sqlite3_open_v2(IntPtr filename, out IntPtr db, int flags, IntPtr vfs);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int sqlite3_prepare_v2(IntPtr db, IntPtr sql, int nByte, out IntPtr statement, IntPtr tail);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int sqlite3_step(IntPtr statement);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int sqlite3_finalize(IntPtr statement);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int sqlite3_close_v2(IntPtr db);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern IntPtr sqlite3_errmsg(IntPtr db);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int sqlite3_column_count(IntPtr statement);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern IntPtr sqlite3_column_name(IntPtr statement, int column);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int sqlite3_column_type(IntPtr statement, int column);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern IntPtr sqlite3_column_text(IntPtr statement, int column);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern int sqlite3_column_bytes(IntPtr statement, int column);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern IntPtr sqlite3_column_blob(IntPtr statement, int column);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern long sqlite3_column_int64(IntPtr statement, int column);

    [DllImport("winsqlite3.dll", CallingConvention = CallingConvention.Cdecl)]
    private static extern double sqlite3_column_double(IntPtr statement, int column);

    private static IntPtr Utf8Pointer(string value) {
        byte[] bytes = Encoding.UTF8.GetBytes(value + "\0");
        IntPtr pointer = Marshal.AllocHGlobal(bytes.Length);
        Marshal.Copy(bytes, 0, pointer, bytes.Length);
        return pointer;
    }

    private static string Utf8(IntPtr pointer, int length) {
        if (pointer == IntPtr.Zero || length <= 0) return "";
        byte[] bytes = new byte[length];
        Marshal.Copy(pointer, bytes, 0, length);
        return Encoding.UTF8.GetString(bytes);
    }

    private static string ColumnString(IntPtr statement, int column) {
        if (sqlite3_column_type(statement, column) == 5) return null;
        IntPtr pointer = sqlite3_column_text(statement, column);
        return Utf8(pointer, sqlite3_column_bytes(statement, column));
    }

    private static object ColumnValue(IntPtr statement, int column) {
        int type = sqlite3_column_type(statement, column);
        if (type == 5) return null;
        if (type == 1) return sqlite3_column_int64(statement, column);
        if (type == 2) return sqlite3_column_double(statement, column);
        if (type == 3) return ColumnString(statement, column);
        if (type == 4) {
            int count = sqlite3_column_bytes(statement, column);
            IntPtr pointer = sqlite3_column_blob(statement, column);
            if (count <= 0 || pointer == IntPtr.Zero) return "";
            if (count > 65536) throw new Exception("COOKIE_BLOB_TOO_LARGE");
            byte[] bytes = new byte[count];
            Marshal.Copy(pointer, bytes, 0, count);
            return Convert.ToBase64String(bytes);
        }
        return null;
    }

    private static IntPtr Prepare(IntPtr db, string sql) {
        IntPtr sqlPointer = Utf8Pointer(sql);
        try {
            IntPtr statement;
            int rc = sqlite3_prepare_v2(db, sqlPointer, -1, out statement, IntPtr.Zero);
            if (rc != SQLITE_OK) throw new Exception("SQLITE_PREPARE_FAILED");
            return statement;
        } finally {
            Marshal.FreeHGlobal(sqlPointer);
        }
    }

    private static List<string> TableColumns(IntPtr db) {
        List<string> result = new List<string>();
        IntPtr statement = Prepare(db, "PRAGMA table_info(cookies)");
        try {
            int rc;
            while ((rc = sqlite3_step(statement)) == SQLITE_ROW) {
                string name = ColumnString(statement, 1);
                if (!String.IsNullOrEmpty(name)) result.Add(name);
            }
            if (rc != SQLITE_DONE) throw new Exception("SQLITE_SCHEMA_READ_FAILED");
        } finally {
            sqlite3_finalize(statement);
        }
        return result;
    }

    public static List<Dictionary<string, object>> ReadCookies(string database) {
        IntPtr db = IntPtr.Zero;
        IntPtr pathPointer = Utf8Pointer(database);
        try {
            int rc = sqlite3_open_v2(pathPointer, out db, SQLITE_OPEN_READONLY, IntPtr.Zero);
            if (rc != SQLITE_OK || db == IntPtr.Zero) throw new Exception("SQLITE_OPEN_FAILED");
            List<string> columns = TableColumns(db);
            string[] required = new string[] { "host_key", "name", "value" };
            foreach (string name in required) {
                if (!columns.Contains(name)) throw new Exception("COOKIE_SCHEMA_UNSUPPORTED");
            }

            string[] wanted = new string[] {
                "host_key", "name", "value", "path", "expires_utc",
                "has_expires", "is_secure", "is_httponly", "samesite"
            };
            List<string> expressions = new List<string>();
            foreach (string name in wanted) {
                expressions.Add(columns.Contains(name) ? "\"" + name + "\"" : "NULL AS \"" + name + "\"");
            }
            expressions.Add(columns.Contains("encrypted_value")
                ? "length(\"encrypted_value\") AS \"encrypted_len\"" : "0 AS \"encrypted_len\"");
            expressions.Add(columns.Contains("encrypted_value")
                ? "\"encrypted_value\" AS \"encrypted_value_b64\"" : "NULL AS \"encrypted_value_b64\"");

            string sql = "SELECT " + String.Join(",", expressions.ToArray()) +
                " FROM cookies WHERE host_key LIKE '%narutowebgame.com' OR host_key LIKE '%oasgames.com'";
            IntPtr statement = Prepare(db, sql);
            try {
                List<Dictionary<string, object>> rows = new List<Dictionary<string, object>>();
                int rc2;
                while ((rc2 = sqlite3_step(statement)) == SQLITE_ROW) {
                    Dictionary<string, object> row = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                    int count = sqlite3_column_count(statement);
                    for (int i = 0; i < count; i++) {
                        string name = ColumnStringName(statement, i);
                        row[name] = ColumnValue(statement, i);
                    }
                    rows.Add(row);
                    if (rows.Count > 10000) throw new Exception("COOKIE_ROW_LIMIT_EXCEEDED");
                }
                if (rc2 != SQLITE_DONE) throw new Exception("SQLITE_QUERY_FAILED");
                return rows;
            } finally {
                sqlite3_finalize(statement);
            }
        } finally {
            Marshal.FreeHGlobal(pathPointer);
            if (db != IntPtr.Zero) sqlite3_close_v2(db);
        }
    }

    private static string ColumnStringName(IntPtr statement, int column) {
        IntPtr pointer = sqlite3_column_name(statement, column);
        if (pointer == IntPtr.Zero) return "column" + column.ToString();
        // sqlite3_column_name returns UTF-8 and column names are fixed ASCII identifiers.
        return Marshal.PtrToStringAnsi(pointer);
    }
}
'@

  Add-Type -TypeDefinition $source -Language CSharp
  $rows = [BrCookieSqliteReader]::ReadCookies($Database)
  $json = ConvertTo-Json -InputObject @($rows) -Compress -Depth 5
  [Console]::Out.WriteLine($json)
  exit 0
}
catch {
  [Console]::Error.WriteLine('BR_COOKIE_READER_FAILED')
  exit 2
}
