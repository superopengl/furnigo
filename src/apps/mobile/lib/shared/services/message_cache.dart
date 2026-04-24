import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sqflite/sqflite.dart';
import '../models/message_model.dart';
import 'local_db.dart';

final messageCacheProvider = Provider<MessageCache>((ref) {
  return MessageCache(ref.read(localDbProvider));
});

class MessageCache {
  final LocalDb _localDb;

  MessageCache(this._localDb);

  Future<List<MessageModel>> getMessages(String chatId) async {
    final db = await _localDb.database;
    final rows = await db.query(
      'message',
      where: 'chat_id = ?',
      whereArgs: [chatId],
      orderBy: 'created_at ASC',
    );
    return rows.map(_fromRow).toList();
  }

  Future<String?> getLatestTimestamp(String chatId) async {
    final db = await _localDb.database;
    final result = await db.rawQuery(
      'SELECT MAX(created_at) AS ts FROM message WHERE chat_id = ?',
      [chatId],
    );
    return result.first['ts'] as String?;
  }

  Future<void> insertMessages(List<MessageModel> messages) async {
    if (messages.isEmpty) return;
    final db = await _localDb.database;
    final batch = db.batch();
    for (final m in messages) {
      batch.insert('message', _toRow(m),
          conflictAlgorithm: ConflictAlgorithm.ignore);
    }
    await batch.commit(noResult: true);
  }

  Future<void> insertMessage(MessageModel message) async {
    final db = await _localDb.database;
    await db.insert('message', _toRow(message),
        conflictAlgorithm: ConflictAlgorithm.ignore);
  }

  Future<void> clearAll() async {
    await _localDb.deleteAll();
  }

  Map<String, dynamic> _toRow(MessageModel m) => {
        'id': m.id,
        'chat_id': m.chatId,
        'sender_id': m.senderId,
        'sender_role': m.senderRole,
        'content_type': m.contentType,
        'content': jsonEncode(m.content),
        'created_at': m.createdAt,
      };

  MessageModel _fromRow(Map<String, dynamic> row) => MessageModel(
        id: row['id'] as String,
        chatId: row['chat_id'] as String,
        senderId: row['sender_id'] as String?,
        senderRole: row['sender_role'] as String,
        contentType: row['content_type'] as String,
        content:
            Map<String, dynamic>.from(jsonDecode(row['content'] as String) as Map),
        createdAt: row['created_at'] as String,
      );
}
