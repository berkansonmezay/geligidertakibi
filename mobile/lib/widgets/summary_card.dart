import 'package:flutter/material.dart';

class SummaryCard extends StatelessWidget {
  final String title;
  final String value;
  final Color color;
  final IconData icon;

  const SummaryCard({super.key, required this.title, required this.value, required this.color, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.04), blurRadius: 8, offset: const Offset(0, 2))],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(9)),
            child: Icon(icon, color: color, size: 18),
          ),
          const Spacer(),
          Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.w500)),
          const SizedBox(height: 3),
          FittedBox(fit: BoxFit.scaleDown, child: Text(value, style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: color))),
        ],
      ),
    );
  }
}
