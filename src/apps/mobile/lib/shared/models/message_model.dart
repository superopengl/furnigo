class MessageModel {
  final String id;
  final String chatId;
  final String? senderId;
  final String senderRole;
  final String contentType;
  final Map<String, dynamic> content;
  final String createdAt;

  MessageModel({
    required this.id,
    required this.chatId,
    this.senderId,
    required this.senderRole,
    required this.contentType,
    required this.content,
    required this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) => MessageModel(
        id: json['id'] as String,
        chatId: json['chatId'] as String,
        senderId: json['senderId'] as String?,
        senderRole: json['senderRole'] as String,
        contentType: json['contentType'] as String,
        content: Map<String, dynamic>.from(json['content'] as Map),
        createdAt: json['createdAt'] as String,
      );

  String get textContent => content['text'] as String? ?? '';
}
