import 'package:flutter/material.dart';
import 'router.dart';
import 'theme/theme.dart';

class FurnigoApp extends StatelessWidget {
  const FurnigoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'Furnigo',
      theme: AppTheme.light,
      routerConfig: router,
      debugShowCheckedModeBanner: false,
    );
  }
}
