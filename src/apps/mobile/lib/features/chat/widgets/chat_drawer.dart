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
      child: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.settings_outlined,
                        color: AppColors.textSecondary),
                    onPressed: () {
                      Navigator.pop(context);
                      onSettings();
                    },
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.add, color: AppColors.primary),
                    onPressed: () {
                      Navigator.pop(context);
                      onNewChat();
                    },
                  ),
                ],
              ),
            ),
            const Divider(height: 1, color: AppColors.border),
            Expanded(
              child: chatsAsync.when(
                loading: () =>
                    const Center(child: CircularProgressIndicator()),
                error: (err, _) => Center(child: Text('Error: $err')),
                data: (chats) => chats.isEmpty
                    ? const Center(
                        child: Text(
                          'No chats yet',
                          style: TextStyle(color: AppColors.textSecondary),
                        ),
                      )
                    : ListView.builder(
                        itemCount: chats.length,
                        itemBuilder: (context, index) {
                          final chat = chats[index];
                          final isActive = chat.id == activeChatId;
                          return ListTile(
                            title: Text(
                              chat.title ?? 'Untitled chat',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontWeight: isActive
                                    ? FontWeight.bold
                                    : FontWeight.normal,
                              ),
                            ),
                            selected: isActive,
                            selectedTileColor: AppColors.surface,
                            onTap: () {
                              Navigator.pop(context);
                              onChatSelected(chat.id);
                            },
                          );
                        },
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
