import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/message_model.dart';
import '../../../shared/services/message_cache.dart';
import '../../../shared/services/socket_service.dart';
import '../services/chat_service.dart';

final chatMessagesProvider = StateNotifierProvider.family<
    ChatMessagesNotifier, List<MessageModel>, String>(
  (ref, chatId) => ChatMessagesNotifier(
    ref.read(chatServiceProvider),
    ref.read(socketServiceProvider),
    ref.read(messageCacheProvider),
    chatId,
  ),
);

class ChatMessagesNotifier extends StateNotifier<List<MessageModel>> {
  final ChatService _chatService;
  final SocketService _socketService;
  final MessageCache _messageCache;
  final String chatId;

  ChatMessagesNotifier(
      this._chatService, this._socketService, this._messageCache, this.chatId)
      : super([]) {
    _load();
    _listen();
  }

  Future<void> _load() async {
    // 1. Load cached messages instantly
    final cached = await _messageCache.getMessages(chatId);
    if (cached.isNotEmpty) {
      state = cached;
    }

    // 2. Find latest cached timestamp
    final latestTimestamp = await _messageCache.getLatestTimestamp(chatId);

    // 3. Fetch new messages from API
    final newMessages = await _chatService.getMessages(
      chatId,
      after: latestTimestamp,
    );

    // 4. Persist new messages to local cache
    if (newMessages.isNotEmpty) {
      await _messageCache.insertMessages(newMessages);
    }

    // 5. Update state
    if (latestTimestamp != null && newMessages.isNotEmpty) {
      state = [...state, ...newMessages];
    } else if (latestTimestamp == null && newMessages.isNotEmpty) {
      state = newMessages;
    }
  }

  void _listen() {
    _socketService.joinChat(chatId);
    _socketService.onNewMessage((data) {
      final msg = data['message'] as Map<String, dynamic>;
      if (msg['chatId'] == chatId) {
        final message = MessageModel.fromJson(msg);
        _messageCache.insertMessage(message);
        if (!state.any((m) => m.id == message.id)) {
          state = [...state, message];
        }
      }
    });
  }

  Future<void> send(String text) async {
    await _chatService.sendMessage(chatId, text: text);
  }

  Future<void> sendImage(String filePath) async {
    final url = await _chatService.uploadImage(filePath);
    await _chatService.sendImage(chatId, url: url);
  }

  @override
  void dispose() {
    _socketService.leaveChat(chatId);
    super.dispose();
  }
}
