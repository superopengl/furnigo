import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/chat_model.dart';
import '../../../shared/services/chat_cache.dart';
import '../services/chat_service.dart';

final chatListProvider =
    AsyncNotifierProvider<ChatListNotifier, List<ChatModel>>(
        ChatListNotifier.new);

class ChatListNotifier extends AsyncNotifier<List<ChatModel>> {
  @override
  Future<List<ChatModel>> build() async {
    final cache = ref.read(chatCacheProvider);

    // Show cached data immediately
    final cached = await cache.getChats();
    if (cached.isNotEmpty) {
      // Refresh from API in the background
      _syncFromApi();
      return cached;
    }

    // No cache — fetch from API and save
    final chats = await ref.read(chatServiceProvider).listChats();
    await cache.replaceAll(chats);
    return chats;
  }

  Future<void> _syncFromApi() async {
    try {
      final chats = await ref.read(chatServiceProvider).listChats();
      await ref.read(chatCacheProvider).replaceAll(chats);
      state = AsyncData(chats);
    } catch (_) {
      // Silently keep cached data on network failure
    }
  }

  Future<ChatModel> createChat({String? title}) async {
    final effectiveTitle = (title != null && title.isNotEmpty) ? title : 'New chat';
    final chat = await ref.read(chatServiceProvider).createChat(title: effectiveTitle);
    ref.invalidateSelf();
    return chat;
  }

  Future<void> updateTitle(String chatId, String title) async {
    await ref.read(chatServiceProvider).updateChat(chatId, title: title);
    // Refresh to get the updated data from server
    ref.invalidateSelf();
  }

  void refresh() => ref.invalidateSelf();
}
