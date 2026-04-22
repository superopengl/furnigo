import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../theme/colors.dart';
import '../../auth/providers/auth_provider.dart';
import '../providers/profile_provider.dart';

class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> {
  final _nameController = TextEditingController();
  bool _editing = false;

  @override
  void dispose() {
    _nameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profileAsync = ref.watch(profileProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Profile')),
      body: profileAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, _) => Center(child: Text('Error: $err')),
        data: (user) {
          if (user == null) {
            return const Center(child: Text('Not logged in'));
          }
          return ListView(
            padding: const EdgeInsets.all(24),
            children: [
              CircleAvatar(
                radius: 40,
                backgroundColor: AppColors.surface,
                child: Text(
                  (user.displayName ?? user.email)[0].toUpperCase(),
                  style: const TextStyle(
                      fontSize: 32, color: AppColors.primary),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Email',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 4),
              Text(user.email, style: Theme.of(context).textTheme.bodyLarge),
              const SizedBox(height: 24),
              Text(
                'Display Name',
                style: Theme.of(context)
                    .textTheme
                    .bodySmall
                    ?.copyWith(color: AppColors.textSecondary),
              ),
              const SizedBox(height: 4),
              if (_editing)
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _nameController,
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                        ),
                        autofocus: true,
                      ),
                    ),
                    const SizedBox(width: 8),
                    IconButton(
                      icon: const Icon(Icons.check),
                      onPressed: () async {
                        await ref
                            .read(profileProvider.notifier)
                            .updateName(_nameController.text.trim());
                        setState(() => _editing = false);
                      },
                    ),
                  ],
                )
              else
                GestureDetector(
                  onTap: () {
                    _nameController.text = user.displayName ?? '';
                    setState(() => _editing = true);
                  },
                  child: Row(
                    children: [
                      Text(
                        user.displayName ?? 'Tap to set name',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(width: 8),
                      const Icon(Icons.edit, size: 16, color: AppColors.textSecondary),
                    ],
                  ),
                ),
              const SizedBox(height: 48),
              OutlinedButton(
                onPressed: () => ref.read(authProvider.notifier).logout(),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: const BorderSide(color: AppColors.error),
                ),
                child: const Text('Log out'),
              ),
            ],
          );
        },
      ),
    );
  }
}
