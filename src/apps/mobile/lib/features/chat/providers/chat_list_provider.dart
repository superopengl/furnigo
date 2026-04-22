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
    final chat = await ref.read(chatServiceProvider).createChat(title: title);
    ref.invalidateSelf();
    return chat;
  }

  void refresh() => ref.invalidateSelf();
}
