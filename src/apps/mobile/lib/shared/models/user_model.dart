class UserModel {
  final String id;
  final String email;
  final String? displayName;
  final String role;
  final String? avatarUrl;

  UserModel({
    required this.id,
    required this.email,
    this.displayName,
    required this.role,
    this.avatarUrl,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) => UserModel(
        id: json['id'] as String,
        email: json['email'] as String,
        displayName: json['displayName'] as String?,
        role: json['role'] as String,
        avatarUrl: json['avatarUrl'] as String?,
      );
}
