import 'package:flutter/material.dart';

const _palette = [
  Color(0xFFC4713B),
  Color(0xFFB8963E),
  Color(0xFF3D7A6B),
  Color(0xFF5B6BAA),
  Color(0xFF9B5EA5),
  Color(0xFFC05555),
  Color(0xFF4A8CB8),
  Color(0xFF7B8A3E),
  Color(0xFFD4885A),
  Color(0xFF6A7B9E),
];

Color _hashColor(String id) {
  var hash = 0;
  for (var i = 0; i < id.length; i++) {
    hash = ((hash * 31) + id.codeUnitAt(i)) & 0xFFFFFFFF;
  }
  return _palette[hash % _palette.length];
}

String _getInitials(String? displayName, String email) {
  if (displayName != null && displayName.trim().isNotEmpty) {
    final parts = displayName.trim().split(RegExp(r'\s+'));
    if (parts.length >= 2) {
      return '${parts.first[0]}${parts.last[0]}'.toUpperCase();
    }
    return parts.first[0].toUpperCase();
  }
  return email[0].toUpperCase();
}

class UserAvatar extends StatelessWidget {
  final String id;
  final String? displayName;
  final String email;
  final String role;
  final String? avatarUrl;
  final double size;

  const UserAvatar({
    super.key,
    required this.id,
    required this.email,
    required this.role,
    this.displayName,
    this.avatarUrl,
    this.size = 32,
  });

  @override
  Widget build(BuildContext context) {
    final color = _hashColor(id);

    if (avatarUrl != null) {
      return CircleAvatar(
        radius: size / 2,
        backgroundImage: NetworkImage(avatarUrl!),
        backgroundColor: color.withValues(alpha: 0.15),
      );
    }

    return CircleAvatar(
      radius: size / 2,
      backgroundColor: color.withValues(alpha: 0.15),
      child: Text(
        _getInitials(displayName, email),
        style: TextStyle(
          color: color,
          fontSize: (size * 0.38).clamp(10, 24),
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}
