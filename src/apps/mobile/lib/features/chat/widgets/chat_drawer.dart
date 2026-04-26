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
                      error: (err, _) =>
                          Center(child: Text('Error: $err')),
                      data: (chats) => chats.isEmpty
                          ? Center(
                              child: Text(
                                'No chats yet',
                                style: TextStyle(
                                    color: AppColors.textSecondary,
                                    fontSize: 14),
                              ),
                            )
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
                  // Footer with legal links
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.glassDark,
                      borderRadius: const BorderRadius.vertical(bottom: Radius.circular(16)),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextButton.icon(
                          label: const Text('Privacy Policy'),
                          icon: const Icon(Icons.privacy_tip, size: 16),
                          onPressed: () {
                            Navigator.pop(context);
                            // Navigate to privacy policy page
                            Navigator.pushNamed(context, '/privacy_policy');
                          },
                        ),
                        TextButton.icon(
                          label: const Text('Terms of Usage'),
                          icon: const Icon(Icons.description, size: 16),
                          onPressed: () {
                            Navigator.pop(context);
                            // Navigate to terms of usage page
                            Navigator.pushNamed(context, '/terms_of_usage');
                          },
                        ),
                      ],
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
