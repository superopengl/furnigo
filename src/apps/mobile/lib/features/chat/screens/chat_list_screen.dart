import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../theme/colors.dart';
import '../providers/chat_list_provider.dart';

class ChatListScreen extends ConsumerWidget {
  const ChatListScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final chatsAsync = ref.watch(chatListProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Chats')),
      body: chatsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(Icons.cloud_off, size: 48, color: AppColors.textSecondary),
                  const SizedBox(height: 12),
                  Text('Unable to load chats',
                      style: TextStyle(fontSize: 16, color: AppColors.textSecondary)),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: () => ref.invalidate(chatListProvider),
                    icon: const Icon(Icons.refresh),
                    label: const Text('Retry'),
                  ),
                ],
              ),
            ),
        data: (chats) => chats.isEmpty
            ? const Center(child: Text('No chats yet. Start a new one!'))
            : RefreshIndicator(
                onRefresh: () async =>
                    ref.read(chatListProvider.notifier).refresh(),
                child: ListView.separated(
                  itemCount: chats.length,
                  separatorBuilder: (_, _) =>
                      const Divider(height: 1, color: AppColors.border),
                  itemBuilder: (context, index) {
                    final chat = chats[index];
                    return ListTile(
                      title: Text(chat.title ?? 'Untitled chat'),
                      subtitle: Text(chat.createdAt.substring(0, 10)),
                      trailing:
                          const Icon(Icons.chevron_right, color: AppColors.textSecondary),
                      onTap: () => context.push('/chats/${chat.id}'),
                    );
                  },
                ),
              ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.secondary,
        onPressed: () async {
          final chat =
              await ref.read(chatListProvider.notifier).createChat();
          if (context.mounted) context.push('/chats/${chat.id}');
        },
        child: const Icon(Icons.add, color: AppColors.white),
      ),
    );
  }
}
