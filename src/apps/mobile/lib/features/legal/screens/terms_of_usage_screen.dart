import 'package:flutter/material.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

class TermsOfUsageScreen extends StatelessWidget {
  const TermsOfUsageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Terms of Usage'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: const InAppWebView(
        initialUrlRequest: URLRequest(
          url: Uri.parse('https://admin.furnigo.com.au/terms_of_usage'),
        ),
      ),
    );
  }
}