class ChatModel {
  final String id;
  final String? title;
  final String createdAt;

  ChatModel({required this.id, this.title, required this.createdAt});

  factory ChatModel.fromJson(Map<String, dynamic> json) => ChatModel(
        id: json['id'] as String,
        title: json['title'] as String?,
        createdAt: json['createdAt'] as String,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'title': title,
        'createdAt': createdAt,
      };
}
