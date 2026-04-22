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

  Future<List<MessageModel>> getMessages(String chatId, {String? cursor}) async {
    final params = <String, dynamic>{'limit': '50'};
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
}
