import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/data_provider.dart';

class BudgetsScreen extends StatelessWidget {
  const BudgetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final dp = context.watch<DataProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: const Text('Bütçe ve Hedefler', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18)),
      ),
      body: dp.isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: dp.refresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Budgets Section
                  _sectionHeader('Aylık Bütçe Limitleri', Icons.pie_chart_outline, const Color(0xFF4F46E5)),
                  const SizedBox(height: 12),
                  ...dp.budgets.map((budget) {
                    final spent = dp.expenses.where((e) => e['category'] == budget['category']).fold<double>(0, (s, e) => s + (e['amount'] as num));
                    final limit = (budget['limit_amount'] as num).toDouble();
                    final pct = limit > 0 ? (spent / limit).clamp(0.0, 1.0) : 0.0;
                    final isOver = spent > limit;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(budget['category'], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
                              Text('₺${spent.toStringAsFixed(0)} / ₺${limit.toStringAsFixed(0)}', style: const TextStyle(color: Colors.grey, fontSize: 13)),
                            ],
                          ),
                          const SizedBox(height: 10),
                          ClipRRect(borderRadius: BorderRadius.circular(3), child: LinearProgressIndicator(value: pct, backgroundColor: Colors.grey[200], color: isOver ? const Color(0xFFEF4444) : const Color(0xFF10B981), minHeight: 8)),
                          const SizedBox(height: 6),
                          Text(isOver ? 'Limit aşıldı! +₺${(spent - limit).toStringAsFixed(0)}' : '₺${(limit - spent).toStringAsFixed(0)} kaldı', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: isOver ? const Color(0xFFEF4444) : const Color(0xFF10B981))),
                        ],
                      ),
                    );
                  }),

                  const SizedBox(height: 24),

                  // Goals Section
                  _sectionHeader('Tasarruf Hedefleri', Icons.flag_outlined, const Color(0xFFF59E0B)),
                  const SizedBox(height: 12),
                  ...dp.goals.map((goal) {
                    final target = (goal['target'] as num).toDouble();
                    final saved = (goal['saved'] as num).toDouble();
                    final pct = target > 0 ? (saved / target).clamp(0.0, 1.0) : 0.0;
                    final isAchieved = saved >= target;
                    return Container(
                      margin: const EdgeInsets.only(bottom: 10),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Expanded(child: Text(goal['title'], style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15))),
                              if (isAchieved) const Icon(Icons.check_circle, color: Color(0xFF10B981), size: 20),
                            ],
                          ),
                          const SizedBox(height: 10),
                          ClipRRect(borderRadius: BorderRadius.circular(3), child: LinearProgressIndicator(value: pct, backgroundColor: Colors.grey[200], color: const Color(0xFFF59E0B), minHeight: 8)),
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [const Text('Birikim', style: TextStyle(fontSize: 11, color: Colors.grey)), Text('₺${saved.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600))]),
                              Text('%${(pct * 100).toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: Color(0xFFF59E0B))),
                              Column(crossAxisAlignment: CrossAxisAlignment.end, children: [const Text('Hedef', style: TextStyle(fontSize: 11, color: Colors.grey)), Text('₺${target.toStringAsFixed(0)}', style: const TextStyle(fontWeight: FontWeight.w600))]),
                            ],
                          ),
                        ],
                      ),
                    );
                  }),
                ],
              ),
            ),
    );
  }

  Widget _sectionHeader(String title, IconData icon, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(width: 8),
        Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
      ],
    );
  }
}
