import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sqflite/sqflite.dart';

final localDbProvider = Provider<LocalDb>((ref) => LocalDb());

class LocalDb {
  Database? _db;

  Future<Database> get database async {
    _db ??= await _open();
    return _db!;
  }

  Future<Database> _open() async {
    final dbPath = await getDatabasesPath();
    return openDatabase('$dbPath/furnigo.db', version: 1, onCreate: _onCreate);
  }

  Future<void> _onCreate(Database db, int version) async {
    await db.execute('''
      CREATE TABLE message (
        id TEXT PRIMARY KEY,
        chat_id TEXT NOT NULL,
        sender_id TEXT,
        sender_role TEXT NOT NULL,
        content_type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL
      )
    ''');
    await db.execute(
        'CREATE INDEX idx_message_chat_created ON message (chat_id, created_at)');
  }

  Future<void> deleteAll() async {
    final db = await database;
    await db.delete('message');
  }

  Future<void> close() async {
    await _db?.close();
    _db = null;
  }
}
