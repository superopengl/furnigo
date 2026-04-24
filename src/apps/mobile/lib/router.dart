import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/auth/screens/login_screen.dart';
import 'features/chat/screens/chat_screen.dart';

GoRouter createRouter(Ref ref) {
  return GoRouter(
    initialLocation: '/chats',
    redirect: (context, state) {
      final auth = ref.read(authProvider);
      final isOnLogin = state.matchedLocation == '/login';

      if (auth.status == AuthStatus.unauthenticated && !isOnLogin) {
        return '/login';
      }
      if (auth.status == AuthStatus.authenticated && isOnLogin) {
        return '/chats';
      }
      return null;
    },
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/chats',
        builder: (context, state) => const ChatScreen(),
      ),
      GoRoute(
        path: '/chats/:id',
        builder: (context, state) => ChatScreen(
          chatId: state.pathParameters['id']!,
        ),
      ),
    ],
  );
}

final routerProvider = Provider<GoRouter>((ref) {
  final router = createRouter(ref);

  ref.listen(authProvider, (prev, next) {
    router.refresh();
  });

  return router;
});
