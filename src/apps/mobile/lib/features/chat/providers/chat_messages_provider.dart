import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/message_model.dart';
import '../../../shared/services/socket_service.dart';
import '../services/chat_service.dart';

final chatMessagesProvider = StateNotifierProvider.family<
    ChatMessagesNotifier, List<MessageModel>, String>(
  (ref, chatId) => ChatMessagesNotifier(
    ref.read(chatServiceProvider),
    ref.read(socketServiceProvider),
    chatId,
  ),
);

class ChatMessagesNotifier extends StateNotifier<List<MessageModel>> {
  final ChatService _chatService;
  final SocketService _socketService;
  final String chatId;

  ChatMessagesNotifier(this._chatService, this._socketService, this.chatId)
      : super([]) {
    _load();
    _listen();
  }

  Future<void> _load() async {
    final messages = await _chatService.getMessages(chatId);
    state = messages;
  }

  void _listen() {
    _socketService.joinChat(chatId);
    _socketService.onNewMessage((data) {
      final msg = data['message'] as Map<String, dynamic>;
      if (msg['chatId'] == chatId) {
        final message = MessageModel.fromJson(msg);
        state = [...state, message];
      }
    });
  }

  Future<void> send(String text) async {
    await _chatService.sendMessage(chatId, text: text);
  }

  @override
  void dispose() {
    _socketService.leaveChat(chatId);
    super.dispose();
  }
}
