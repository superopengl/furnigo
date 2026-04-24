import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/chat_model.dart';
import '../services/chat_service.dart';

final chatListProvider =
    AsyncNotifierProvider<ChatListNotifier, List<ChatModel>>(
        ChatListNotifier.new);

class ChatListNotifier extends AsyncNotifier<List<ChatModel>> {
  @override
  Future<List<ChatModel>> build() async {
    return ref.read(chatServiceProvider).listChats();
  }

  Future<ChatModel> createChat({String? title}) async {
    final effectiveTitle = (title != null && title.isNotEmpty) ? title : 'New chat';
    final chat = await ref.read(chatServiceProvider).createChat(title: effectiveTitle);
    ref.invalidateSelf();
    return chat;
  }

  Future<void> updateTitle(String chatId, String title) async {
    await ref.read(chatServiceProvider).updateChat(chatId, title: title);
    ref.invalidateSelf();
  }

  void refresh() => ref.invalidateSelf();
}
