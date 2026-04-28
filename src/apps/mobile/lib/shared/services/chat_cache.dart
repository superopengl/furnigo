import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat_model.dart';
import 'local_db.dart';

final chatCacheProvider = Provider<ChatCache>((ref) {
  return ChatCache(ref.read(localDbProvider));
});

class ChatCache {
  final LocalDb _localDb;

  ChatCache(this._localDb);

  Future<List<ChatModel>> getChats() async {
    final db = await _localDb.database;
    final rows = await db.query('chat', orderBy: 'created_at DESC');
    return rows.map(_fromRow).toList();
  }

  Future<void> replaceAll(List<ChatModel> chats) async {
    final db = await _localDb.database;
    await db.transaction((txn) async {
      await txn.delete('chat');
      final batch = txn.batch();
      for (final c in chats) {
        batch.insert('chat', _toRow(c));
      }
      await batch.commit(noResult: true);
    });
  }

  Future<void> clearAll() async {
    final db = await _localDb.database;
    await db.delete('chat');
  }

  Map<String, dynamic> _toRow(ChatModel c) => {
        'id': c.id,
        'title': c.title,
        'created_at': c.createdAt,
      };

  ChatModel _fromRow(Map<String, dynamic> row) => ChatModel(
        id: row['id'] as String,
        title: row['title'] as String?,
        createdAt: row['created_at'] as String,
      );
}
