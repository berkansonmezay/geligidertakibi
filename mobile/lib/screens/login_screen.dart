import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import 'dashboard_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  bool _isRegister = false;
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passCtrl = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Container(
            constraints: const BoxConstraints(maxWidth: 440),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.07), blurRadius: 16, offset: const Offset(0, 4))],
            ),
            padding: const EdgeInsets.all(32),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 70, height: 70,
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(colors: [Color(0xFF4F46E5), Color(0xFF0ea5e9)]),
                      borderRadius: BorderRadius.circular(18),
                    ),
                    child: const Center(child: Text('💰', style: TextStyle(fontSize: 32))),
                  ),
                ),
                const SizedBox(height: 20),
                Center(child: Text('Aile Bütçesi', style: Theme.of(context).textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700))),
                const SizedBox(height: 6),
                Center(child: Text(_isRegister ? 'Yeni hesap oluşturun' : 'Devam etmek için giriş yapın', style: TextStyle(color: Colors.grey[600]))),
                const SizedBox(height: 32),

                if (auth.error != null)
                  Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(color: Colors.red[50], borderRadius: BorderRadius.circular(10)),
                    child: Text(auth.error!, style: const TextStyle(color: Colors.red)),
                  ),

                if (_isRegister) ...[
                  _buildField('Ad Soyad', _nameCtrl, Icons.person_outline),
                  const SizedBox(height: 16),
                ],
                _buildField('E-posta Adresi', _emailCtrl, Icons.email_outlined),
                const SizedBox(height: 16),
                _buildField('Şifre', _passCtrl, Icons.lock_outline, obscure: true),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF4F46E5),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                    onPressed: auth.isLoading ? null : () async {
                      final success = _isRegister
                          ? await auth.register(_nameCtrl.text, _emailCtrl.text, _passCtrl.text)
                          : await auth.login(_emailCtrl.text, _passCtrl.text);

                      if (success && context.mounted) {
                        await context.read<DataProvider>().refresh();
                        Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const DashboardScreen()));
                      }
                    },
                    child: auth.isLoading
                        ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                        : Text(_isRegister ? 'Kayıt Ol' : 'Giriş Yap', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                  ),
                ),

                const SizedBox(height: 20),
                Center(
                  child: TextButton(
                    onPressed: () => setState(() => _isRegister = !_isRegister),
                    child: Text(_isRegister ? 'Zaten hesabınız var mı? Giriş Yap' : 'Hesabınız yok mu? Kayıt Ol', style: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, IconData icon, {bool obscure = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 14)),
        const SizedBox(height: 6),
        TextField(
          controller: ctrl,
          obscureText: obscure,
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 20, color: Colors.grey[500]),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE5E7EB))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF4F46E5), width: 2)),
            filled: true, fillColor: Colors.white,
          ),
        ),
      ],
    );
  }
}
