import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import '../../../theme/colors.dart';
import '../services/chat_service.dart';
import '../providers/chat_list_provider.dart';

final _joinPattern = RegExp(
  r'chats/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/join',
  caseSensitive: false,
);

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
    await _handleScannedValue(barcode.rawValue!);
  }

  Future<void> _pickImage() async {
    final image = await ImagePicker().pickImage(source: ImageSource.gallery);
    if (image == null) return;

    setState(() => _processing = true);

    try {
      final capture = await _controller.analyzeImage(image.path);
      final barcode = capture?.barcodes.firstOrNull;
      if (barcode == null || barcode.rawValue == null) {
        _showError('No QR code found in the image');
        return;
      }
      await _handleScannedValue(barcode.rawValue!);
    } catch (e) {
      _showError('Failed to analyze image: $e');
    }
  }

  Future<void> _handleScannedValue(String raw) async {
    if (_processing) return;
    setState(() => _processing = true);

    final match = _joinPattern.firstMatch(raw);
    if (match == null) {
      _showError('Invalid QR code');
      return;
    }

    final chatId = match.group(1)!;

    try {
      await ref.read(chatServiceProvider).joinChat(chatId);
      ref.read(chatListProvider.notifier).refresh();
      if (mounted) context.go('/chats/$chatId');
    } catch (e) {
      _showError('Failed to join chat: $e');
    }
  }

  void _showError(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message)),
    );
    setState(() => _processing = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        foregroundColor: Colors.white,
        title: const Text('Scan to join chat'),
        actions: [
          IconButton(
            icon: const Icon(Icons.photo_library_outlined),
            tooltip: 'Pick from gallery',
            onPressed: _processing ? null : _pickImage,
          ),
        ],
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
              'Point camera at chat QR code\nor pick a photo from gallery',
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
