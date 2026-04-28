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
    return openDatabase(
      '$dbPath/furnigo.db',
      version: 2,
      onCreate: _onCreate,
      onUpgrade: _onUpgrade,
    );
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
    await _createChatTable(db);
  }

  Future<void> _onUpgrade(Database db, int oldVersion, int newVersion) async {
    if (oldVersion < 2) {
      await _createChatTable(db);
    }
  }

  Future<void> _createChatTable(Database db) async {
    await db.execute('''
      CREATE TABLE chat (
        id TEXT PRIMARY KEY,
        title TEXT,
        created_at TEXT NOT NULL
      )
    ''');
  }

  Future<void> deleteAll() async {
    final db = await database;
    await db.delete('message');
    await db.delete('chat');
  }

  Future<void> close() async {
    await _db?.close();
    _db = null;
  }
}
