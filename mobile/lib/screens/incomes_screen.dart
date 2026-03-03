import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';

class IncomesScreen extends StatelessWidget {
  const IncomesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dp = context.watch<DataProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Gelirler', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
            Text('${dp.selectedYear} · ${dp.currentPeriodLabel}', style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.normal)),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF10B981),
        onPressed: () => _showAddModal(context, dp),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: dp.isLoading
          ? const Center(child: CircularProgressIndicator())
          : dp.incomes.isEmpty
              ? const Center(child: Text('Bu dönem için gelir kaydı yok.', style: TextStyle(color: Colors.grey)))
              : RefreshIndicator(
                  onRefresh: dp.refresh,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: dp.incomes.length,
                    itemBuilder: (ctx, i) {
                      final item = dp.incomes[i];
                      return Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          leading: Container(
                            width: 42, height: 42,
                            decoration: BoxDecoration(color: const Color(0xFF10B981).withOpacity(0.1), borderRadius: BorderRadius.circular(10)),
                            child: const Icon(Icons.wallet_outlined, color: Color(0xFF10B981), size: 20),
                          ),
                          title: Text(item['title'], style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('${item['category']} · ${item['date']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          trailing: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Text('+₺${(item['amount'] as num).toStringAsFixed(0)}', style: const TextStyle(color: Color(0xFF10B981), fontWeight: FontWeight.w700)),
                              IconButton(icon: const Icon(Icons.delete_outline, color: Colors.grey, size: 18), onPressed: () => dp.deleteIncome(item['id'])),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }

  void _showAddModal(BuildContext ctx, DataProvider dp) {
    final titleCtrl = TextEditingController();
    final amountCtrl = TextEditingController();
    final List<dynamic> incomeCats = dp.appSettings['income_categories'] ?? ['Maaş', 'Ek Gelir', 'Kira Geliri', 'Yatırım'];
    String category = incomeCats.contains('Maaş') ? 'Maaş' : incomeCats.first.toString();
    String date = DateTime.now().toIso8601String().substring(0, 10);

    showModalBottomSheet(
      context: ctx,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (_) => StatefulBuilder(
        builder: (ctx2, setState) => Padding(
          padding: EdgeInsets.only(left: 24, right: 24, top: 24, bottom: MediaQuery.of(ctx2).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Yeni Gelir Ekle', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
              const SizedBox(height: 20),
              TextField(controller: titleCtrl, decoration: InputDecoration(labelText: 'Başlık', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)))),
              const SizedBox(height: 12),
              TextField(controller: amountCtrl, keyboardType: TextInputType.number, decoration: InputDecoration(labelText: 'Tutar (₺)', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)))),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: category,
                decoration: InputDecoration(labelText: 'Kategori', border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                items: incomeCats.map((c) => DropdownMenuItem(value: c.toString(), child: Text(c.toString()))).toList(),
                onChanged: (v) => setState(() => category = v!),
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF10B981), foregroundColor: Colors.white, padding: const EdgeInsets.symmetric(vertical: 14), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                  onPressed: () async {
                    if (titleCtrl.text.isNotEmpty && amountCtrl.text.isNotEmpty) {
                      await dp.addIncome({'title': titleCtrl.text, 'amount': double.parse(amountCtrl.text), 'category': category, 'date': date});
                      if (ctx.mounted) Navigator.pop(ctx);
                    }
                  },
                  child: const Text('Kaydet', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
