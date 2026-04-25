import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import '../../../theme/colors.dart';
import '../../../shared/models/message_model.dart';
import '../../../shared/providers/auth_store.dart';
import '../../profile/screens/profile_screen.dart';
import '../../../shared/models/user_model.dart';
import '../providers/chat_list_provider.dart';
import '../providers/chat_messages_provider.dart';
import '../providers/chat_participants_provider.dart';
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
    _controller.addListener(() {
      if (_activeChatId != null && _controller.text.isNotEmpty) {
        ref.read(chatMessagesProvider(_activeChatId!).notifier).sendTyping();
      }
    });
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

  void _showEditTitleDialog(String? currentTitle) async {
    final chatId = _activeChatId;
    if (chatId == null) return;

    final editController = TextEditingController(text: currentTitle ?? '');
    final newTitle = await showGeneralDialog<String>(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'Edit title',
      barrierColor: Colors.black54,
      transitionDuration: const Duration(milliseconds: 250),
      transitionBuilder: (context, animation, secondaryAnimation, child) {
        return SlideTransition(
          position: Tween<Offset>(
            begin: const Offset(0, -1),
            end: Offset.zero,
          ).animate(CurvedAnimation(
            parent: animation,
            curve: Curves.easeOut,
          )),
          child: child,
        );
      },
      pageBuilder: (context, animation, secondaryAnimation) {
        return Align(
          alignment: Alignment.topCenter,
          child: Material(
            color: AppColors.background,
            borderRadius:
                const BorderRadius.vertical(bottom: Radius.circular(20)),
            child: SafeArea(
              bottom: false,
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text(
                      'Edit chat title',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 16),
                    TextField(
                      controller: editController,
                      autofocus: true,
                      decoration: const InputDecoration(
                        hintText: 'Enter chat title',
                      ),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: () => Navigator.pop(
                            context, editController.text.trim()),
                        child: const Text('Save'),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      },
    );

    if (newTitle != null && newTitle.isNotEmpty && mounted) {
      ref.read(chatListProvider.notifier).updateTitle(chatId, newTitle);
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
    return chatId!;
  }

  void _showAttachmentOptions() {
    showModalBottomSheet(
      context: context,
      builder: (context) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 8),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('Photo Library'),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Navigator.pop(context);
                _pickAndSendImage(ImageSource.gallery);
              },
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('Camera'),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
              onTap: () {
                Navigator.pop(context);
                _pickAndSendImage(ImageSource.camera);
              },
            ),
            const SizedBox(height: 8),
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
    await ref
        .read(chatMessagesProvider(chatId).notifier)
        .sendImage(image.path);
    _scrollToBottom();
  }

  void _showProfile() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
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

    final participantsAsync = effectiveChatId != null
        ? ref.watch(chatParticipantsProvider(effectiveChatId))
        : null;
    final participants = participantsAsync?.valueOrNull ?? <String, UserModel>{};

    // Auto-scroll on initial load and when a new message is appended
    if (effectiveChatId != null) {
      ref.listen<List<MessageModel>>(
        chatMessagesProvider(effectiveChatId),
        (prev, next) {
          if (next.isNotEmpty &&
              (prev == null || prev.isEmpty || next.last.id != prev.last.id)) {
            _scrollToBottom();
          }
        },
      );
    }
    // Scroll to bottom when messages are already cached on build
    if (messages.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToBottom());
    }

    final activeChat = effectiveChatId != null && chats != null
        ? chats.where((c) => c.id == effectiveChatId).firstOrNull
        : null;
    final chatTitle = activeChat?.title;
    final topPadding =
        MediaQuery.of(context).padding.top + kToolbarHeight + 4;

    return Scaffold(
      key: _scaffoldKey,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.format_list_bulleted),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        actions: const [SizedBox(width: 48)],
        flexibleSpace: ClipRect(
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
            child: Container(color: AppColors.glassLight),
          ),
        ),
        title: GestureDetector(
          onTap: effectiveChatId != null
              ? () => _showEditTitleDialog(chatTitle)
              : null,
          child: Text(
            chatTitle ?? 'Untitled chat',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
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
                effectiveChatId, messages, chatsAsync.isLoading, topPadding, participants),
          ),
          if (effectiveChatId != null) _buildTypingIndicator(effectiveChatId),
          _buildInputBar(),
        ],
      ),
    );
  }

  Widget _buildMessageArea(String? chatId, List<MessageModel> messages,
      bool isLoading, double topPadding, Map<String, UserModel> participants) {
    if (isLoading) {
      return Center(
          child: Padding(
        padding: EdgeInsets.only(top: topPadding),
        child: const CircularProgressIndicator(strokeWidth: 2),
      ));
    }

    if (messages.isEmpty) {
      return Center(
        child: Padding(
          padding: EdgeInsets.only(top: topPadding),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(Icons.chat_bubble_outline,
                  size: 48, color: AppColors.border),
              const SizedBox(height: 12),
              Text(
                'Start a conversation',
                style: TextStyle(
                    color: AppColors.textSecondary, fontSize: 15),
              ),
            ],
          ),
        ),
      );
    }

    return ListView.builder(
      controller: _scrollController,
      padding: EdgeInsets.fromLTRB(16, topPadding, 16, 8),
      itemCount: messages.length,
      itemBuilder: (context, index) {
        final msg = messages[index];
        final sender = msg.senderId != null ? participants[msg.senderId] : null;
        return MessageBubble(
          message: msg,
          isMe: msg.senderId == _currentUserId,
          sender: sender,
        );
      },
    );
  }

  Widget _buildTypingIndicator(String chatId) {
    final typingUsers = ref.watch(typingUsersProvider(chatId));
    // Filter out self
    final others = typingUsers.where((id) => id != _currentUserId).toSet();
    if (others.isEmpty) return const SizedBox.shrink();
    return Padding(
      padding: const EdgeInsets.only(left: 24, bottom: 4),
      child: Align(
        alignment: Alignment.centerLeft,
        child: Text(
          others.length == 1 ? 'Someone is typing...' : 'Multiple people are typing...',
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.textSecondary,
            fontStyle: FontStyle.italic,
          ),
        ),
      ),
    );
  }

  Widget _buildInputBar() {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(12, 4, 12, 8),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: IconButton(
                icon: const Icon(Icons.add),
                onPressed: _showAttachmentOptions,
                style: IconButton.styleFrom(
                  backgroundColor: AppColors.surface,
                  foregroundColor: AppColors.textSecondary,
                  fixedSize: const Size(34, 34),
                  padding: EdgeInsets.zero,
                ),
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: DecoratedBox(
                decoration: BoxDecoration(
                  color: AppColors.glassLight,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.glassBorder),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x0A000000),
                      blurRadius: 12,
                      offset: Offset(0, -2),
                    ),
                  ],
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const SizedBox(width: 16),
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        minLines: 1,
                        maxLines: 5,
                        maxLength: 1000,
                        buildCounter: (context, {required currentLength, required isFocused, required maxLength}) => null,
                        decoration: const InputDecoration(
                          hintText: 'Message...',
                          hintStyle:
                              TextStyle(color: AppColors.textSecondary),
                          border: InputBorder.none,
                          enabledBorder: InputBorder.none,
                          focusedBorder: InputBorder.none,
                          filled: false,
                          contentPadding:
                              EdgeInsets.symmetric(vertical: 10),
                        ),
                        textInputAction: TextInputAction.newline,
                      ),
                    ),
                    Padding(
                      padding:
                          const EdgeInsets.only(right: 4, bottom: 4),
                      child: IconButton(
                        icon: const Icon(Icons.arrow_upward),
                        onPressed: _send,
                        style: IconButton.styleFrom(
                          backgroundColor: AppColors.surface,
                          foregroundColor: AppColors.textSecondary,
                          fixedSize: const Size(34, 34),
                          padding: EdgeInsets.zero,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
