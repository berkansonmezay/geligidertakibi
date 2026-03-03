import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late Map<String, dynamic> _localSettings;
  bool _isLoading = false;
  final TextEditingController _incomeCatController = TextEditingController();
  final TextEditingController _expenseCatController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _localSettings = Map.from(context.read<DataProvider>().appSettings);
  }

  @override
  void dispose() {
    _incomeCatController.dispose();
    _expenseCatController.dispose();
    super.dispose();
  }

  void _togglePeriod(String id) {
    setState(() {
      final List<dynamic> periods = List.from(_localSettings['enabled_periods']);
      if (periods.contains(id)) {
        if (periods.length > 1) periods.remove(id);
      } else {
        periods.add(id);
      }
      _localSettings['enabled_periods'] = periods;
    });
  }

  void _addYear() {
    setState(() {
      final List<dynamic> years = List.from(_localSettings['enabled_years']);
      final int lastYear = years.map((e) => int.parse(e.toString())).reduce((a, b) => a > b ? a : b);
      years.add(lastYear + 1);
      years.sort();
      _localSettings['enabled_years'] = years;
    });
  }

  void _removeYear(int year) {
    setState(() {
      final List<dynamic> years = List.from(_localSettings['enabled_years']);
      if (years.length > 1) {
        years.removeWhere((e) => int.parse(e.toString()) == year);
        _localSettings['enabled_years'] = years;
      }
    });
  }

  void _addCategory(String type) {
    final controller = type == 'income' ? _incomeCatController : _expenseCatController;
    final key = type == 'income' ? 'income_categories' : 'expense_categories';
    final name = controller.text.trim();
    if (name.isEmpty) return;

    setState(() {
      final List<dynamic> cats = List.from(_localSettings[key]);
      if (!cats.contains(name)) {
        cats.add(name);
        _localSettings[key] = cats;
      }
      controller.clear();
    });
  }

  void _editCategory(String type, String oldName) {
    final controller = TextEditingController(text: oldName);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Kategoriyi Düzenle'),
        content: TextField(controller: controller, decoration: const InputDecoration(hintText: 'Yeni isim')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('İptal')),
          TextButton(
            onPressed: () {
              final newName = controller.text.trim();
              if (newName.isNotEmpty && newName != oldName) {
                final key = type == 'income' ? 'income_categories' : 'expense_categories';
                setState(() {
                  final List<dynamic> cats = List.from(_localSettings[key]);
                  final idx = cats.indexOf(oldName);
                  if (idx != -1) cats[idx] = newName;
                  _localSettings[key] = cats;
                });
              }
              Navigator.pop(ctx);
            },
            child: const Text('Kaydet'),
          )
        ],
      ),
    );
  }

  void _removeCategory(String type, String name) {
    final key = type == 'income' ? 'income_categories' : 'expense_categories';
    setState(() {
      final List<dynamic> cats = List.from(_localSettings[key]);
      if (cats.length > 1) {
        cats.remove(name);
        _localSettings[key] = cats;
      }
    });
  }

  Future<void> _save() async {
    setState(() => _isLoading = true);
    try {
      await context.read<DataProvider>().updateAppSettings(_localSettings);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Ayarlar kaydedildi.')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Hata oluştu.'), backgroundColor: Colors.red));
      }
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final List<dynamic> enabledP = _localSettings['enabled_periods'];
    final List<dynamic> enabledY = _localSettings['enabled_years'];
    final List<dynamic> incomeCats = _localSettings['income_categories'] ?? [];
    final List<dynamic> expenseCats = _localSettings['expense_categories'] ?? [];

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('Ayarlar', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
        actions: [
          if (_isLoading)
            const Padding(padding: EdgeInsets.all(16.0), child: SizedBox(width: 20, height: 20, child: CircularProgressIndicator(strokeWidth: 2)))
          else
            TextButton.icon(
              onPressed: _save,
              icon: const Icon(Icons.save_outlined),
              label: const Text('Kaydet'),
            )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          _sectionHeader('Dönem Filtreleri'),
          const SizedBox(height: 12),
          _periodTile('monthly', 'Aylık', enabledP.contains('monthly')),
          _periodTile('quarterly', '3 Aylık (Çeyrek)', enabledP.contains('quarterly')),
          _periodTile('semi-annually', '6 Aylık', enabledP.contains('semi-annually')),
          _periodTile('yearly', 'Yıllık', enabledP.contains('yearly')),

          const SizedBox(height: 24),
          _sectionHeader('Dönem Yılları'),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              ...enabledY.map((y) => Chip(
                    label: Text(y.toString()),
                    onDeleted: () => _removeYear(int.parse(y.toString())),
                    backgroundColor: Colors.white,
                    side: const BorderSide(color: Color(0xFFE5E7EB)),
                  )),
              ActionChip(
                label: const Text('+ Yıl Ekle'),
                onPressed: _addYear,
                backgroundColor: const Color(0xFF4F46E5).withOpacity(0.1),
                labelStyle: const TextStyle(color: Color(0xFF4F46E5), fontWeight: FontWeight.bold),
                side: BorderSide.none,
              ),
            ],
          ),

          const SizedBox(height: 24),
          _sectionHeader('Gelir Kategorileri'),
          const SizedBox(height: 12),
          _categoryListV2('income', incomeCats),
          _addCategoryRow('income', _incomeCatController),

          const SizedBox(height: 24),
          _sectionHeader('Gider Kategorileri'),
          const SizedBox(height: 12),
          _categoryListV2('expense', expenseCats),
          _addCategoryRow('expense', _expenseCatController),

          const SizedBox(height: 24),
          _sectionHeader('Para Birimi'),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
            child: TextField(
              controller: TextEditingController(text: _localSettings['currency']),
              onChanged: (v) => _localSettings['currency'] = v,
              decoration: const InputDecoration(border: InputBorder.none, hintText: 'Para Birimi Simgesi'),
            ),
          ),

          const SizedBox(height: 32),
          const Text(
            'Uygulama genelinde kullanılan filtreleri ve görünümü buradan özelleştirebilirsiniz. Değişiklikler tüm cihazlarınızla senkronize edilir.',
            style: TextStyle(fontSize: 12, color: Colors.grey, height: 1.5),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Text(title, style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w700, color: Color(0xFF4F46E5)));
  }

  Widget _categoryListV2(String type, List<dynamic> categories) {
    return Column(
      children: categories.map((c) => Container(
        margin: const EdgeInsets.only(bottom: 8),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.withOpacity(0.1))),
        child: ListTile(
          dense: true,
          title: Text(c.toString(), style: const TextStyle(fontWeight: FontWeight.w500)),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(icon: const Icon(Icons.edit_outlined, size: 18, color: Colors.blueGrey), onPressed: () => _editCategory(type, c.toString())),
              IconButton(icon: const Icon(Icons.delete_outline, size: 18, color: Colors.redAccent), onPressed: () => _removeCategory(type, c.toString())),
            ],
          ),
        ),
      )).toList(),
    );
  }

  Widget _addCategoryRow(String type, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.only(top: 8.0),
      child: Row(
        children: [
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
              child: TextField(
                controller: controller,
                decoration: const InputDecoration(border: InputBorder.none, hintText: 'Yeni kategori...', hintStyle: TextStyle(fontSize: 13)),
              ),
            ),
          ),
          const SizedBox(width: 8),
          ElevatedButton(
            onPressed: () => _addCategory(type),
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF4F46E5), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
            child: const Text('Ekle'),
          )
        ],
      ),
    );
  }

  Widget _periodTile(String id, String label, bool isActive) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        onTap: () => _togglePeriod(id),
        title: Text(label, style: const TextStyle(fontWeight: FontWeight.w500)),
        trailing: Icon(isActive ? Icons.check_circle : Icons.circle_outlined, color: isActive ? const Color(0xFF10B981) : Colors.grey),
      ),
    );
  }
}
