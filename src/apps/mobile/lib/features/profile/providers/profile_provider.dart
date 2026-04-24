import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/user_model.dart';
import '../../../shared/services/api_client.dart';

final profileProvider =
    AsyncNotifierProvider<ProfileNotifier, UserModel?>(ProfileNotifier.new);

class ProfileNotifier extends AsyncNotifier<UserModel?> {
  @override
  Future<UserModel?> build() async {
    try {
      final dio = ref.read(apiClientProvider);
      final res = await dio.get('/users/me');
      return UserModel.fromJson(res.data['data'] as Map<String, dynamic>);
    } catch (_) {
      return null;
    }
  }

  Future<void> updateName(String displayName) async {
    final dio = ref.read(apiClientProvider);
    await dio.put('/users/me', data: {'displayName': displayName});
    ref.invalidateSelf();
  }

  Future<void> updateAvatar(String avatarUrl) async {
    final dio = ref.read(apiClientProvider);
    await dio.put('/users/me', data: {'avatarUrl': avatarUrl});
    ref.invalidateSelf();
  }
}
