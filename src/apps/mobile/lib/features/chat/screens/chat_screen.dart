import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
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

  void _showEditTitleDialog(String? currentTitle) {
    final chatId = _activeChatId;
    if (chatId == null) return;

    final editController = TextEditingController(text: currentTitle ?? '');
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Edit chat title'),
        content: TextField(
          controller: editController,
          autofocus: true,
          decoration: const InputDecoration(
            hintText: 'Enter chat title',
            border: OutlineInputBorder(),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () {
              final newTitle = editController.text.trim();
              Navigator.pop(context);
              if (newTitle.isNotEmpty) {
                ref
                    .read(chatListProvider.notifier)
                    .updateTitle(chatId, newTitle);
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    ).then((_) => editController.dispose());
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

    final chatId = await _ensureChatId();
    ref.read(chatMessagesProvider(chatId).notifier).send(text);
    _controller.clear();
    _scrollToBottom();
  }

  Future<String> _ensureChatId() async {
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
    return chatId;
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Photo Library'),
              onTap: () {
                Navigator.pop(context);
                _pickAndSendImage(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Camera'),
              onTap: () {
                Navigator.pop(context);
                _pickAndSendImage(ImageSource.camera);
              },
            ),
          ],
        ),
      ),
    );
  }

  void _pickAndSendImage(ImageSource source) async {
    final image = await ImagePicker().pickImage(
      source: source,
      maxWidth: 1200,
      imageQuality: 70,
    );
    if (image == null) return;

    final chatId = await _ensureChatId();
    await ref.read(chatMessagesProvider(chatId).notifier).sendImage(image.path);
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

    final activeChat = effectiveChatId != null && chats != null
        ? chats.where((c) => c.id == effectiveChatId).firstOrNull
        : null;
    final chatTitle = activeChat?.title;

    return Scaffold(
      key: _scaffoldKey,
      appBar: AppBar(
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.format_list_bulleted),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        actions: const [SizedBox(width: 48)],
        title: GestureDetector(
          onTap: effectiveChatId != null
              ? () => _showEditTitleDialog(chatTitle)
              : null,
          child: Text(
            chatTitle ?? 'Untitled chat',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  color: AppColors.textSecondary,
                ),
          ),
        ),
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
            IconButton(
              icon: const Icon(Icons.add, color: AppColors.textSecondary),
              onPressed: _showAttachmentOptions,
            ),
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
