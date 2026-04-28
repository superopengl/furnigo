import 'package:flutter/material.dart';
import '../../../config/env.dart';
import '../../../theme/colors.dart';
import '../../../shared/models/message_model.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/widgets/user_avatar.dart';

class MessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool isMe;
  final UserModel? sender;

  const MessageBubble({
    super.key,
    required this.message,
    required this.isMe,
    this.sender,
  });

  @override
  Widget build(BuildContext context) {
    if (message.senderRole == 'system') {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 8),
        child: Center(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: AppColors.glassDark,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              message.textContent,
              style: Theme.of(context)
                  .textTheme
                  .bodySmall
                  ?.copyWith(color: AppColors.textSecondary),
            ),
          ),
        ),
      );
    }

    final isText = message.contentType == 'text' || message.contentType == null;

    final bubble = Container(
      padding: isText
          ? const EdgeInsets.symmetric(horizontal: 16, vertical: 10)
          : EdgeInsets.zero,
      constraints:
          BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.7),
      decoration: isText
          ? BoxDecoration(
              color: isMe ? AppColors.primary : AppColors.surface,
              borderRadius: BorderRadius.only(
                topLeft: const Radius.circular(18),
                topRight: const Radius.circular(18),
                bottomLeft: Radius.circular(isMe ? 18 : 4),
                bottomRight: Radius.circular(isMe ? 4 : 18),
              ),
            )
          : null,
      child: _buildContent(context),
    );

    final s = sender;
    if (isMe || s == null) {
      return Align(
        alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 3),
          child: bubble,
        ),
      );
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          UserAvatar(
            id: s.id,
            displayName: s.displayName,
            email: s.email,
            role: s.role,
            avatarUrl: s.avatarUrl,
            size: 28,
          ),
          const SizedBox(width: 8),
          Flexible(child: bubble),
        ],
      ),
    );
  }

  Widget _buildContent(BuildContext context) {
    final textColor = isMe ? AppColors.white : AppColors.text;

    switch (message.contentType) {
      case 'image':
        final url = message.content['url'] as String?;
        final caption = message.content['caption'] as String?;
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (url != null)
              ClipRRect(
                borderRadius: BorderRadius.circular(12),
                child: Image.network(
                  Env.resolveUrl(url),
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) {
                    return Container(
                      width: 240,
                      height: 180,
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        border: Border.all(color: AppColors.border),
                        borderRadius: BorderRadius.circular(12)
                      ),
                      child: const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.broken_image, size: 32, color: AppColors.textSecondary),
                            SizedBox(height: 8),
                            Text(
                              'Image cannot be shown',
                              style: TextStyle(color: AppColors.textSecondary),
                              textAlign: TextAlign.center,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
              ),
            if (caption != null) ...[
              const SizedBox(height: 6),
              Text(caption, style: TextStyle(color: textColor)),
            ],
          ],
        );
      default:
        return Text(
          message.textContent,
          style: TextStyle(color: textColor, height: 1.35),
        );
    }
  }
}
