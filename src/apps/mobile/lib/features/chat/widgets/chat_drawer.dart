import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/colors.dart';
import '../providers/chat_list_provider.dart';

class ChatDrawer extends ConsumerWidget {
  final String? activeChatId;
  final ValueChanged<String> onChatSelected;
  final VoidCallback onNewChat;
  final VoidCallback onSettings;

  const ChatDrawer({
    super.key,
    this.activeChatId,
    required this.onChatSelected,
    required this.onNewChat,
    required this.onSettings,
  });

  Widget _buildEmptyState(BuildContext context) {
    return Center(
      child: GestureDetector(
        onTap: () {
          Navigator.pop(context);
          onNewChat();
        },
        child: Text(
          '+ Start a new chat',
          style: TextStyle(
            color: AppColors.primary,
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatsAsync = ref.watch(chatListProvider);

    return Drawer(
      backgroundColor: Colors.transparent,
      child: ClipRRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 28, sigmaY: 28),
          child: Container(
            color: AppColors.glassLight,
            child: SafeArea(
              child: Column(
                children: [
                  // Header
                  Padding(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    child: Row(
                      children: [
                        IconButton(
                          icon: const Icon(Icons.settings_outlined,
                              size: 22, color: AppColors.textSecondary),
                          onPressed: () {
                            Navigator.pop(context);
                            onSettings();
                          },
                        ),
                        const Spacer(),
                        IconButton(
                          icon: const Icon(Icons.edit_square,
                              size: 22, color: AppColors.primary),
                          onPressed: () {
                            Navigator.pop(context);
                            onNewChat();
                          },
                        ),
                      ],
                    ),
                  ),
                  // Chat list
                  Expanded(
                    child: chatsAsync.when(
                      loading: () => const Center(
                          child:
                              CircularProgressIndicator(strokeWidth: 2)),
                      error: (err, _) => _buildEmptyState(context),
                      data: (chats) => chats.isEmpty
                          ? _buildEmptyState(context)
                          : ListView.builder(
                              padding:
                                  const EdgeInsets.symmetric(horizontal: 8),
                              itemCount: chats.length,
                              itemBuilder: (context, index) {
                                final chat = chats[index];
                                final isActive =
                                    chat.id == activeChatId;
                                return Padding(
                                  padding: const EdgeInsets.symmetric(
                                      vertical: 1),
                                  child: ListTile(
                                    dense: true,
                                    title: Text(
                                      chat.title ?? 'Untitled chat',
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: isActive
                                            ? FontWeight.w600
                                            : FontWeight.normal,
                                        color: isActive
                                            ? AppColors.text
                                            : AppColors.textSecondary,
                                      ),
                                    ),
                                    shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(10),
                                    ),
                                    selectedTileColor: AppColors.glassDark,
                                    selected: isActive,
                                    onTap: () {
                                      Navigator.pop(context);
                                      onChatSelected(chat.id);
                                    },
                                  ),
                                );
                              },
                            ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
