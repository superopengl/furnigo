import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/services/api_client.dart';

final chatParticipantsProvider = FutureProvider.family<Map<String, UserModel>, String>(
  (ref, chatId) async {
    final dio = ref.read(apiClientProvider);
    final res = await dio.get('/chats/$chatId');
    final participants = res.data['data']['participants'] as List;
    final map = <String, UserModel>{};
    for (final p in participants) {
      final json = p as Map<String, dynamic>;
      final id = json['userId'] as String;
      map[id] = UserModel(
        id: id,
        email: json['email'] as String,
        displayName: json['displayName'] as String?,
        role: json['role'] as String,
        avatarUrl: json['avatarUrl'] as String?,
      );
    }
    return map;
  },
);
