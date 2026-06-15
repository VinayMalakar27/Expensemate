import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ScrollView, Alert, ActivityIndicator
} from 'react-native';
import { addExpense } from '../services/api';

const CATEGORIES = [
  { name: 'Food', emoji: '🍔' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Bills', emoji: '📄' },
  { name: 'Health', emoji: '💊' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Salary', emoji: '💰' },
  { name: 'Other', emoji: '💸' },
];

export default function AddExpenseScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Please fill in title and amount');
      return;
    }

    setLoading(true);
    try {
      await addExpense({ title, amount: Number(amount), type, category, date, note });
      Alert.alert('Success! ✅', 'Transaction added successfully', [
        { text: 'OK', onPress: () => {
          setTitle('');
          setAmount('');
          setNote('');
        }}
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Add Transaction</Text>
      </View>

      {/* Type Toggle */}
      <View style={styles.typeToggle}>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'expense' && styles.typeBtnActive]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeBtnText, type === 'expense' && styles.typeBtnTextActive]}>
            ❤️ Expense
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeBtn, type === 'income' && styles.typeBtnActiveIncome]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeBtnText, type === 'income' && styles.typeBtnTextActive]}>
            💚 Income
          </Text>
        </TouchableOpacity>
      </View>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text style={styles.rupeeSign}>₹</Text>
        <TextInput
          style={styles.amountInput}
          placeholder="0"
          placeholderTextColor="#444"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />
      </View>

      {/* Form */}
      <View style={styles.form}>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Lunch, Uber, Netflix"
          placeholderTextColor="#666"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.name}
              style={[styles.categoryChip, category === cat.name && styles.categoryChipActive]}
              onPress={() => setCategory(cat.name)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text style={[styles.categoryName, category === cat.name && styles.categoryNameActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#666"
        />

        <Text style={styles.label}>Note (Optional)</Text>
        <TextInput
          style={[styles.input, styles.noteInput]}
          placeholder="Add a note..."
          placeholderTextColor="#666"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Add Transaction</Text>
          )}
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F0F1A',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  typeToggle: {
    flexDirection: 'row',
    marginHorizontal: 24,
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  typeBtnActive: {
    backgroundColor: '#FF5252',
  },
  typeBtnActiveIncome: {
    backgroundColor: '#4CAF50',
  },
  typeBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  typeBtnTextActive: {
    color: '#FFFFFF',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  rupeeSign: {
    fontSize: 40,
    color: '#6C63FF',
    fontWeight: 'bold',
  },
  amountInput: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#FFFFFF',
    minWidth: 100,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
  },
  label: {
    color: '#999',
    fontSize: 13,
    marginBottom: 8,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2E2E3E',
  },
  noteInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    backgroundColor: '#1E1E2E',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginRight: 8,
    minWidth: 70,
    borderWidth: 1,
    borderColor: '#2E2E3E',
  },
  categoryChipActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  categoryEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    color: '#999',
    fontSize: 11,
  },
  categoryNameActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: '#6C63FF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});