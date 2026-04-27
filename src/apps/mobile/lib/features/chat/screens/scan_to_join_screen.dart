import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../theme/colors.dart';
import '../services/chat_service.dart';
import '../providers/chat_list_provider.dart';

class ScanToJoinScreen extends ConsumerStatefulWidget {
  const ScanToJoinScreen({super.key});

  @override
  ConsumerState<ScanToJoinScreen> createState() => _ScanToJoinScreenState();
}

class _ScanToJoinScreenState extends ConsumerState<ScanToJoinScreen> {
  final _controller = MobileScannerController();
  bool _processing = false;

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _onDetect(BarcodeCapture capture) async {
    if (_processing) return;
    final barcode = capture.barcodes.firstOrNull;
    if (barcode == null || barcode.rawValue == null) return;

    setState(() => _processing = true);

    final raw = barcode.rawValue!;
    // Extract chat ID — accept raw UUID or a URL ending with the UUID
    final uuidPattern = RegExp(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', caseSensitive: false);
    final match = uuidPattern.firstMatch(raw);

    if (match == null) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Invalid QR code')),
        );
        setState(() => _processing = false);
      }
      return;
    }

    final chatId = match.group(0)!;

    try {
      await ref.read(chatServiceProvider).joinChat(chatId);
      ref.read(chatListProvider.notifier).refresh();
      if (mounted) context.go('/chats/$chatId');
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to join chat: $e')),
        );
        setState(() => _processing = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: const Text('Scan to join chat'),
      ),
      body: Stack(
        children: [
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),
          // Scan overlay
          Center(
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.accent, width: 2),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),
          if (_processing)
            Container(
              color: Colors.black54,
              child: const Center(
                child: CircularProgressIndicator(
                  color: AppColors.accent,
                  strokeWidth: 2,
                ),
              ),
            ),
          // Hint text
          Positioned(
            bottom: 120,
            left: 0,
            right: 0,
            child: Text(
              'Point camera at chat QR code',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.8),
                fontSize: 15,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
