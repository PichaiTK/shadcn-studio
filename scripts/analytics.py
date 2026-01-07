"""
Sales Analytics Script
Analyzes sales data and generates reports
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import json

class SalesAnalytics:
    def __init__(self, data_path='sales_data.csv'):
        """Initialize analytics with data file"""
        self.data = pd.read_csv(data_path)
        self.data['date'] = pd.to_datetime(self.data['date'])
        
    def top_products(self, n=10):
        """Get top N selling products"""
        return (self.data
                .groupby('product')['quantity']
                .sum()
                .sort_values(ascending=False)
                .head(n))
    
    def daily_revenue(self, days=30):
        """Calculate daily revenue for last N days"""
        cutoff = datetime.now() - timedelta(days=days)
        recent = self.data[self.data['date'] > cutoff]
        return (recent
                .groupby('date')['total']
                .sum()
                .sort_index())
    
    def customer_segmentation(self):
        """Segment customers by purchase behavior"""
        customer_stats = (self.data
                         .groupby('customer_id')
                         .agg({
                             'total': 'sum',
                             'order_id': 'count'
                         }))
        
        # RFM segmentation
        customer_stats['segment'] = pd.cut(
            customer_stats['total'],
            bins=[0, 1000, 5000, float('inf')],
            labels=['Bronze', 'Silver', 'Gold']
        )
        
        return customer_stats
    
    def generate_report(self, output_path='report.png'):
        """Generate visual sales report"""
        fig, axes = plt.subplots(2, 2, figsize=(15, 10))
        
        # Top products
        top_prods = self.top_products()
        top_prods.plot(kind='bar', ax=axes[0, 0], color='steelblue')
        axes[0, 0].set_title('Top 10 Products')
        axes[0, 0].set_xlabel('Product')
        axes[0, 0].set_ylabel('Quantity Sold')
        
        # Daily revenue trend
        daily_rev = self.daily_revenue()
        daily_rev.plot(ax=axes[0, 1], color='green')
        axes[0, 1].set_title('Daily Revenue (Last 30 Days)')
        axes[0, 1].set_xlabel('Date')
        axes[0, 1].set_ylabel('Revenue (THB)')
        
        # Category distribution
        category_sales = self.data.groupby('category')['total'].sum()
        axes[1, 0].pie(category_sales, labels=category_sales.index, autopct='%1.1f%%')
        axes[1, 0].set_title('Sales by Category')
        
        # Customer segments
        segments = self.customer_segmentation()
        segment_counts = segments['segment'].value_counts()
        segment_counts.plot(kind='bar', ax=axes[1, 1], color=['#CD7F32', '#C0C0C0', '#FFD700'])
        axes[1, 1].set_title('Customer Segments')
        axes[1, 1].set_xlabel('Segment')
        axes[1, 1].set_ylabel('Number of Customers')
        
        plt.tight_layout()
        plt.savefig(output_path, dpi=300, bbox_inches='tight')
        print(f"Report saved to {output_path}")
    
    def export_json(self, output_path='analytics.json'):
        """Export analytics data as JSON"""
        analytics = {
            'generated_at': datetime.now().isoformat(),
            'top_products': self.top_products().to_dict(),
            'daily_revenue': self.daily_revenue().to_dict(),
            'customer_segments': self.customer_segmentation()['segment'].value_counts().to_dict(),
            'summary': {
                'total_revenue': float(self.data['total'].sum()),
                'total_orders': int(self.data['order_id'].nunique()),
                'total_customers': int(self.data['customer_id'].nunique()),
                'avg_order_value': float(self.data.groupby('order_id')['total'].sum().mean())
            }
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(analytics, f, indent=2, ensure_ascii=False)
        
        print(f"Analytics exported to {output_path}")

# Usage example
if __name__ == '__main__':
    # Initialize analytics
    analytics = SalesAnalytics('sales_data.csv')
    
    # Generate visual report
    analytics.generate_report('sales_report.png')
    
    # Export JSON data
    analytics.export_json('analytics.json')
    
    # Print summary
    print("\n=== Sales Summary ===")
    print(f"Total Revenue: {analytics.data['total'].sum():,.2f} THB")
    print(f"Total Orders: {analytics.data['order_id'].nunique():,}")
    print(f"Total Customers: {analytics.data['customer_id'].nunique():,}")
    print(f"\nTop 5 Products:")
    print(analytics.top_products(5))
