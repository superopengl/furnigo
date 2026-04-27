import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../shared/models/chat_model.dart';
import '../../../shared/models/message_model.dart';
import '../../../shared/services/api_client.dart';

final chatServiceProvider = Provider<ChatService>((ref) {
  return ChatService(ref.read(apiClientProvider));
});

class ChatService {
  final Dio _dio;

  ChatService(this._dio);

  Future<List<ChatModel>> listChats() async {
    final res = await _dio.get('/chats');
    final list = res.data['data'] as List;
    return list.map((e) => ChatModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<ChatModel> createChat({String? title}) async {
    final res = await _dio.post('/chats', data: {'title': title});
    return ChatModel.fromJson(res.data['data'] as Map<String, dynamic>);
  }

  Future<void> updateChat(String chatId, {String? title}) async {
    await _dio.put('/chats/$chatId', data: {
      // ignore: use_null_aware_elements
      if (title != null) 'title': title,
    });
  }

  Future<List<MessageModel>> getMessages(String chatId, {String? cursor, String? after}) async {
    final params = <String, dynamic>{'limit': '50'};
    if (after != null) params['after'] = after;
    if (cursor != null) params['cursor'] = cursor;

    final res = await _dio.get('/chats/$chatId/messages', queryParameters: params);
    final list = res.data['data'] as List;
    return list.map((e) => MessageModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<MessageModel> sendMessage(String chatId, {required String text}) async {
    final res = await _dio.post('/chats/$chatId/messages', data: {
      'contentType': 'text',
      'content': {'text': text},
    });
    return MessageModel.fromJson(res.data['data'] as Map<String, dynamic>);
  }

  Future<String> uploadImage(String filePath) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(filePath),
    });
    final res = await _dio.post('/uploads', data: formData);
    return res.data['data']['url'] as String;
  }

  Future<Map<String, dynamic>> joinChat(String chatId) async {
    final res = await _dio.post('/chats/$chatId/join');
    return res.data['data'] as Map<String, dynamic>;
  }

  Future<MessageModel> sendImage(String chatId, {required String url}) async {
    final res = await _dio.post('/chats/$chatId/messages', data: {
      'contentType': 'image',
      'content': {'url': url},
    });
    return MessageModel.fromJson(res.data['data'] as Map<String, dynamic>);
  }
}
