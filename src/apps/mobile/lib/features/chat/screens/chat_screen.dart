import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/colors.dart';
import '../../../shared/models/message_model.dart';
import '../../../shared/providers/auth_store.dart';
import '../../profile/screens/profile_screen.dart';
import '../providers/chat_list_provider.dart';
import '../providers/chat_messages_provider.dart';
import '../widgets/chat_drawer.dart';
import '../widgets/message_bubble.dart';

class ChatScreen extends ConsumerStatefulWidget {
  final String? chatId;

  const ChatScreen({super.key, this.chatId});

  @override
  ConsumerState<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends ConsumerState<ChatScreen> {
  final _controller = TextEditingController();
  final _scrollController = ScrollController();
  final _scaffoldKey = GlobalKey<ScaffoldState>();
  String? _currentUserId;
  String? _activeChatId;

  @override
  void initState() {
    super.initState();
    _activeChatId = widget.chatId;
    ref.read(authStoreProvider).getUserId().then((id) {
      if (mounted) setState(() => _currentUserId = id);
    });
  }

  @override
  void didUpdateWidget(covariant ChatScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.chatId != oldWidget.chatId) {
      _activeChatId = widget.chatId;
    }
  }

  void _scrollToBottom() {
    Future.delayed(const Duration(milliseconds: 100), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
        );
      }
    });
  }

  void _send() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    var chatId = _activeChatId;
    if (chatId == null) {
      final chats = ref.read(chatListProvider).valueOrNull;
      if (chats != null && chats.isNotEmpty) {
        chatId = chats.first.id;
      }
    }

    if (chatId == null) {
      final chat = await ref.read(chatListProvider.notifier).createChat();
      chatId = chat.id;
    }

    setState(() => _activeChatId = chatId);
    ref.read(chatMessagesProvider(chatId).notifier).send(text);
    _controller.clear();
    _scrollToBottom();
  }

  void _showProfile() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
      ),
      builder: (context) => SizedBox(
        height: MediaQuery.of(context).size.height * 0.85,
        child: const ProfileScreen(),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final chatsAsync = ref.watch(chatListProvider);
    final chats = chatsAsync.valueOrNull;
    final firstChatId =
        (chats != null && chats.isNotEmpty) ? chats.first.id : null;
    final effectiveChatId = _activeChatId ?? firstChatId;

    final messages = effectiveChatId != null
        ? ref.watch(chatMessagesProvider(effectiveChatId))
        : <MessageModel>[];

    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.format_list_bulleted),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: const Text('Chat'),
      ),
      drawer: ChatDrawer(
        activeChatId: effectiveChatId,
        onChatSelected: (chatId) =>
            setState(() => _activeChatId = chatId),
        onNewChat: () async {
          final chat =
              await ref.read(chatListProvider.notifier).createChat();
          setState(() => _activeChatId = chat.id);
        },
        onSettings: _showProfile,
      ),
      body: Column(
        children: [
          Expanded(
            child: _buildMessageArea(
                effectiveChatId, messages, chatsAsync.isLoading),
          ),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessageArea(
      String? chatId, List<MessageModel> messages, bool isLoading) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (messages.isEmpty) {
      return const Center(child: Text('Send a message to start'));
    }

    return ListView.builder(
      controller: _scrollController,
      padding: const EdgeInsets.all(12),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final msg = messages[index];
        return MessageBubble(
          message: msg,
          isMe: msg.senderId == _currentUserId,
        );
      },
    );
  }

  Widget _buildInputBar() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: const BoxDecoration(
        color: AppColors.surface,
        border: Border(top: BorderSide(color: AppColors.border)),
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Expanded(
              child: TextField(
                controller: _controller,
                decoration: const InputDecoration(
                  hintText: 'Type a message...',
                  border: InputBorder.none,
                ),
                textInputAction: TextInputAction.send,
                onSubmitted: (_) => _send(),
              ),
            ),
            IconButton(
              icon: const Icon(Icons.send, color: AppColors.primary),
              onPressed: _send,
            ),
          ],
        ),
      ),
    );
  }
}
