import 'package:flutter/material.dart';
import '../../../theme/colors.dart';
import '../../../shared/models/message_model.dart';

class MessageBubble extends StatelessWidget {
  final MessageModel message;
  final bool isMe;

  const MessageBubble({super.key, required this.message, required this.isMe});

  @override
  Widget build(BuildContext context) {
    if (message.senderRole == 'system') {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Center(
          child: Text(
            message.textContent,
            style: Theme.of(context)
                .textTheme
                .bodySmall
                ?.copyWith(color: AppColors.textSecondary),
          ),
        ),
      );
    }

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        constraints:
            BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
        decoration: BoxDecoration(
          color: isMe ? AppColors.primary : AppColors.surface,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(16),
            topRight: const Radius.circular(16),
            bottomLeft: Radius.circular(isMe ? 16 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 16),
          ),
        ),
        child: _buildContent(context),
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
                borderRadius: BorderRadius.circular(8),
                child: Image.network(url, fit: BoxFit.cover),
              ),
            if (caption != null) ...[
              const SizedBox(height: 4),
              Text(caption, style: TextStyle(color: textColor)),
            ],
          ],
        );
      default:
        return Text(
          message.textContent,
          style: TextStyle(color: textColor),
        );
    }
  }
}
