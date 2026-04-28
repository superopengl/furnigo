import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../../../theme/colors.dart';
import '../providers/auth_provider.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _emailController = TextEditingController();
  final _otpControllers = List.generate(6, (_) => TextEditingController());
  final _otpFocusNodes = List.generate(6, (_) => FocusNode());
  String? _otpId;
  bool _loading = false;
  bool _googleLoading = false;
  String? _error;

  String get _otpCode => _otpControllers.map((c) => c.text).join();

  Future<void> _sendOtp() async {
    final email = _emailController.text.trim();
    if (email.isEmpty) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final otpId = await ref.read(authProvider.notifier).sendOtp(email);
      setState(() {
        _otpId = otpId;
        _loading = false;
      });
      _otpFocusNodes[0].requestFocus();
    } catch (e) {
      setState(() {
        _error = 'Failed to send verification code. Please try again.';
        _loading = false;
      });
    }
  }

  Future<void> _verifyOtp() async {
    final code = _otpCode;
    if (code.length != 6 || _otpId == null) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    await ref.read(authProvider.notifier).verifyOtp(_otpId!, code);

    final authState = ref.read(authProvider);
    if (authState.status != AuthStatus.authenticated) {
      _clearOtp();
      setState(() {
        _error = authState.error ?? 'Verification failed.';
        _loading = false;
      });
      _otpFocusNodes[0].requestFocus();
    }
  }

  void _onOtpDigitChanged(int index, String value) {
    if (value.length == 1 && index < 5) {
      _otpFocusNodes[index + 1].requestFocus();
    }
    if (_otpCode.length == 6) {
      _verifyOtp();
    }
  }

  void _onOtpKeyPress(int index, KeyEvent event) {
    if (event is KeyDownEvent &&
        event.logicalKey == LogicalKeyboardKey.backspace &&
        _otpControllers[index].text.isEmpty &&
        index > 0) {
      _otpControllers[index - 1].clear();
      _otpFocusNodes[index - 1].requestFocus();
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() {
      _googleLoading = true;
      _error = null;
    });

    try {
      await ref.read(authProvider.notifier).signInWithGoogle();
    } on GoogleSignInException catch (e) {
      if (e.code == GoogleSignInExceptionCode.canceled) {
        if (mounted) setState(() => _googleLoading = false);
        return;
      }
      debugPrint('[GoogleSignIn] error: ${e.code} — ${e.description}');
      if (mounted) {
        setState(() {
          _error = 'Google sign-in failed. Please try again.';
          _googleLoading = false;
        });
      }
    } catch (e) {
      debugPrint('[GoogleSignIn] unexpected error: $e');
      if (mounted) {
        setState(() {
          _error = 'Google sign-in failed. Please try again.';
          _googleLoading = false;
        });
      }
    }
  }

  void _clearOtp() {
    for (final c in _otpControllers) {
      c.clear();
    }
  }

  @override
  void dispose() {
    _emailController.dispose();
    for (final c in _otpControllers) {
      c.dispose();
    }
    for (final n in _otpFocusNodes) {
      n.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(28),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Logo area
                Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Padding(
                    padding: const EdgeInsets.all(4),
                    child: Image.asset(
                      'assets/images/logo.png',
                      fit: BoxFit.contain,
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Furnigo',
                  style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Premium furniture, factory to your door',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.textSecondary,
                      ),
                ),
                const SizedBox(height: 40),

                // Login form
                Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                      TextField(
                        controller: _emailController,
                        decoration: const InputDecoration(
                          labelText: 'Email',
                          prefixIcon: Icon(Icons.email_outlined, size: 20),
                        ),
                        keyboardType: TextInputType.emailAddress,
                        enabled: _otpId == null,
                      ),
                      if (_otpId != null) ...[
                        const SizedBox(height: 20),
                        if (_loading)
                          const SizedBox(
                            height: 20,
                            width: 20,
                            child:
                                CircularProgressIndicator(strokeWidth: 2),
                          )
                        else
                          Row(
                            mainAxisAlignment:
                                MainAxisAlignment.spaceBetween,
                            children: List.generate(
                                6,
                                (i) => SizedBox(
                                      width: 44,
                                      child: KeyboardListener(
                                        focusNode: FocusNode(),
                                        onKeyEvent: (event) =>
                                            _onOtpKeyPress(i, event),
                                        child: TextField(
                                          controller: _otpControllers[i],
                                          focusNode: _otpFocusNodes[i],
                                          textAlign: TextAlign.center,
                                          keyboardType:
                                              TextInputType.number,
                                          inputFormatters: [
                                            LengthLimitingTextInputFormatter(
                                                1),
                                            FilteringTextInputFormatter
                                                .digitsOnly,
                                          ],
                                          decoration: InputDecoration(
                                            counterText: '',
                                            contentPadding:
                                                const EdgeInsets.symmetric(
                                                    vertical: 12),
                                            border: OutlineInputBorder(
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      10),
                                            ),
                                            enabledBorder:
                                                OutlineInputBorder(
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      10),
                                              borderSide: const BorderSide(
                                                  color: AppColors.border),
                                            ),
                                            focusedBorder:
                                                OutlineInputBorder(
                                              borderRadius:
                                                  BorderRadius.circular(
                                                      10),
                                              borderSide: const BorderSide(
                                                  color:
                                                      AppColors.secondary,
                                                  width: 1.5),
                                            ),
                                            filled: true,
                                            fillColor: AppColors.surface,
                                          ),
                                          style: Theme.of(context)
                                              .textTheme
                                              .titleLarge,
                                          onChanged: (value) =>
                                              _onOtpDigitChanged(i, value),
                                        ),
                                      ),
                                    )),
                          ),
                      ],
                      if (_otpId == null) ...[
                        const SizedBox(height: 20),
                        SizedBox(
                          width: double.infinity,
                          child: DecoratedBox(
                            decoration: BoxDecoration(
                              gradient: const LinearGradient(
                                colors: [
                                  AppColors.secondary,
                                  AppColors.accent,
                                ],
                              ),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: FilledButton(
                              onPressed: _loading ? null : _sendOtp,
                              style: FilledButton.styleFrom(
                                backgroundColor: Colors.transparent,
                                disabledBackgroundColor: Colors.transparent,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              child: _loading
                                  ? const SizedBox(
                                      height: 20,
                                      width: 20,
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: Colors.white,
                                      ),
                                    )
                                  : const Text('Send Verification Code'),
                            ),
                          ),
                        ),
                        // Divider
                        const SizedBox(height: 20),
                        Row(
                          children: [
                            const Expanded(child: Divider(color: AppColors.border)),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 16),
                              child: Text(
                                'or',
                                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                      color: AppColors.textSecondary,
                                    ),
                              ),
                            ),
                            const Expanded(child: Divider(color: AppColors.border)),
                          ],
                        ),
                        const SizedBox(height: 20),
                        // Google Sign-In button
                        SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            onPressed:
                                (_googleLoading || _loading) ? null : _signInWithGoogle,
                            style: OutlinedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              side: const BorderSide(color: AppColors.border),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(20),
                              ),
                            ),
                            icon: _googleLoading
                                ? const SizedBox(
                                    height: 18,
                                    width: 18,
                                    child: CircularProgressIndicator(strokeWidth: 2),
                                  )
                                : const Text(
                                    'G',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF4285F4),
                                    ),
                                  ),
                            label: const Text('Continue with Google'),
                          ),
                        ),
                      ],
                      if (_otpId != null) ...[
                        const SizedBox(height: 12),
                        TextButton(
                          onPressed: () => setState(() {
                            _otpId = null;
                            _clearOtp();
                            _error = null;
                          }),
                          child: const Text('Use a different email'),
                        ),
                      ],
                  ],
                ),
                if (_error != null) ...[
                  const SizedBox(height: 12),
                  Text(_error!,
                      style: const TextStyle(
                          color: AppColors.error, fontSize: 13)),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
