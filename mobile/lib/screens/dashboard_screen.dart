import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import '../providers/auth_provider.dart';
import '../providers/data_provider.dart';
import '../widgets/summary_card.dart';
import 'login_screen.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<DataProvider>().refresh();
    });
  }

  @override
  Widget build(BuildContext context) {
    final dp = context.watch<DataProvider>();
    final auth = context.watch<AuthProvider>();
    final summary = dp.summary;

    final totalIncome = (summary['total_income'] ?? 0.0) as num;
    final totalExpense = (summary['total_expense'] ?? 0.0) as num;
    final balance = (summary['balance'] ?? 0.0) as num;
    final savingsRate = double.tryParse(summary['savings_rate']?.toString() ?? '0') ?? 0.0;

    final categoryData = (summary['category_breakdown'] as List<dynamic>?) ?? [];

    final List<Color> pieColors = [
      const Color(0xFF4F46E5), const Color(0xFF10B981), const Color(0xFFF59E0B),
      const Color(0xFFEF4444), const Color(0xFF0ea5e9), const Color(0xFF8B5CF6),
    ];

    return Scaffold(
      backgroundColor: const Color(0xFFF3F4F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Aile Bütçesi', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 18, color: Color(0xFF4F46E5))),
            Text('${dp.selectedYear} • ${dp.currentPeriodLabel}', style: const TextStyle(fontSize: 12, color: Colors.grey, fontWeight: FontWeight.w400)),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.tune, color: Color(0xFF4F46E5)),
            onSelected: (val) {
              if (val.startsWith('y:')) {
                dp.updateFilter(year: int.parse(val.substring(2)));
              } else {
                dp.updateFilter(period: val);
              }
            },
            itemBuilder: (_) {
              final List<dynamic> years = dp.appSettings['enabled_years'] ?? [2024, 2025, 2026];
              return [
                ...years.map((y) => PopupMenuItem(value: 'y:$y', child: Text(y.toString()))),
                const PopupMenuDivider(),
                ...dp.availablePeriods.map((p) => PopupMenuItem(value: p['id'], child: Text(p['label']!))),
              ];
            },
          ),
          IconButton(
            icon: const Icon(Icons.logout_outlined, color: Colors.grey),
            onPressed: () async {
              await auth.logout();
              if (context.mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
            },
          ),
        ],
      ),
      body: dp.isLoading
          ? const Center(child: CircularProgressIndicator(color: Color(0xFF4F46E5)))
          : RefreshIndicator(
              onRefresh: dp.refresh,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Summary Cards Grid
                  GridView.count(
                    crossAxisCount: 2,
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: 1.6,
                    children: [
                      SummaryCard(title: 'Toplam Gelir', value: '₺${totalIncome.toStringAsFixed(0)}', color: const Color(0xFF10B981), icon: Icons.wallet_outlined),
                      SummaryCard(title: 'Toplam Gider', value: '₺${totalExpense.toStringAsFixed(0)}', color: const Color(0xFFEF4444), icon: Icons.credit_card_outlined),
                      SummaryCard(title: 'Kalan Bakiye', value: '₺${balance.toStringAsFixed(0)}', color: const Color(0xFF4F46E5), icon: Icons.trending_up),
                      SummaryCard(title: 'Tasarruf Oranı', value: '%${savingsRate.toStringAsFixed(1)}', color: const Color(0xFFF59E0B), icon: Icons.savings_outlined),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Pie Chart
                  if (categoryData.isNotEmpty) ...[
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Kategori Bazlı Harcamalar', style: TextStyle(fontSize: 15, fontWeight: FontWeight.w600)),
                          const SizedBox(height: 16),
                          SizedBox(
                            height: 200,
                            child: PieChart(PieChartData(
                              sections: categoryData.asMap().entries.map((e) {
                                final i = e.key;
                                final item = e.value;
                                final total = categoryData.fold<double>(0, (s, c) => s + (c['total'] as num));
                                final pct = total > 0 ? (item['total'] as num) / total * 100 : 0;
                                return PieChartSectionData(
                                  value: (item['total'] as num).toDouble(),
                                  color: pieColors[i % pieColors.length],
                                  title: '${pct.toStringAsFixed(0)}%',
                                  radius: 70,
                                  titleStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white),
                                );
                              }).toList(),
                              sectionsSpace: 2,
                              centerSpaceRadius: 30,
                            )),
                          ),
                          const SizedBox(height: 12),
                          Wrap(
                            spacing: 12, runSpacing: 4,
                            children: categoryData.asMap().entries.map((e) {
                              return Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Container(width: 10, height: 10, decoration: BoxDecoration(color: pieColors[e.key % pieColors.length], shape: BoxShape.circle)),
                                  const SizedBox(width: 4),
                                  Text(e.value['category'] ?? '', style: const TextStyle(fontSize: 12)),
                                  const SizedBox(width: 4),
                                  Text('₺${(e.value['total'] as num).toStringAsFixed(0)}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                ],
                              );
                            }).toList(),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                  ],
                ],
              ),
            ),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF4F46E5),
        onTap: (i) {
          if (i == _selectedIndex) return;
          if (i == 0) return; // Already here
          if (i == 1) Navigator.pushNamed(context, '/incomes');
          if (i == 2) Navigator.pushNamed(context, '/expenses');
          if (i == 3) Navigator.pushNamed(context, '/budgets');
          if (i == 4) Navigator.pushNamed(context, '/settings');
        },
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.dashboard_outlined), label: 'Dashboard'),
          BottomNavigationBarItem(icon: Icon(Icons.wallet_outlined), label: 'Gelirler'),
          BottomNavigationBarItem(icon: Icon(Icons.credit_card_outlined), label: 'Giderler'),
          BottomNavigationBarItem(icon: Icon(Icons.pie_chart_outline), label: 'Bütçe'),
          BottomNavigationBarItem(icon: Icon(Icons.settings_outlined), label: 'Ayarlar'),
        ],
      ),
    );
  }
}
