import React, { useState, useRef, useContext, useEffect } from 'react';
import { TextField, Typography, Grid, Button, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';

import Snackbar from '../../Snackbar/Snackbar';
import formatDate from '../../../utils/formatDate';
import { ExpenseTrackerContext } from '../../../context/context';
import { incomeCategories, expenseCategories } from '../../../constants/categories';
import useStyles from './styles';

const initialState = {
  amount: '',
  category: '',
  type: 'Income',
  date: formatDate(new Date()),
};

const NewTransactionForm = () => {
  const classes = useStyles();
  const { addTransaction } = useContext(ExpenseTrackerContext);
  const [formData, setFormData] = useState(initialState);
  const [open, setOpen] = useState(false);

  // Refs for form fields
  const typeRef = useRef(null);
  const categoryRef = useRef(null);
  const amountRef = useRef(null);
  const dateRef = useRef(null);

  // Initialize Speech Recognition only if supported
  let recognition;
  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      parseSpeechInput(spokenText);
    };
  } else {
    console.warn("Web Speech API is not supported by this browser.");
  }

  const startListening = () => {
    if (recognition) {
      recognition.start();
    } else {
      alert("Sorry, your browser does not support the Web Speech API.");
    }
  };

  // Function to parse speech input and populate form fields
  const parseSpeechInput = (spokenText) => {
    const lowerText = spokenText.toLowerCase();

    // Parse type (income or expense)
    const type = lowerText.includes("income") ? "Income" : lowerText.includes("expense") ? "Expense" : formData.type;
    setFormData((prev) => ({ ...prev, type }));
    if (typeRef.current) typeRef.current.value = type;

    // Parse category
    const category = incomeCategories.concat(expenseCategories)
      .map((c) => c.type)
      .find((c) => lowerText.includes(c.toLowerCase())) || formData.category;
    setFormData((prev) => ({ ...prev, category }));
    if (categoryRef.current) categoryRef.current.value = category;

    // Parse amount
    const amountMatch = lowerText.match(/(\d+(\.\d+)?)/);
    const amount = amountMatch ? amountMatch[0] : formData.amount;
    setFormData((prev) => ({ ...prev, amount }));
    if (amountRef.current) amountRef.current.value = amount;

    // Parse date
    const parsedDate = parseDate(lowerText);
    if (parsedDate) {
      const formattedDate = formatDate(parsedDate);
      setFormData((prev) => ({ ...prev, date: formattedDate }));
      if (dateRef.current) dateRef.current.value = formattedDate;
    }
  };

  // Date parsing function to handle various date formats
  const parseDate = (inputText) => {
    const today = new Date();
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    
    // Check for specific days of the week, e.g., "next Monday"
    for (let i = 0; i < dayNames.length; i++) {
      if (inputText.includes(`next ${dayNames[i]}`)) {
        const targetDay = (i + 7 - today.getDay()) % 7 || 7; // Calculate days until next specific day
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + targetDay);
        return nextDay;
      } else if (inputText.includes(dayNames[i])) {
        const targetDay = (i + 7 - today.getDay()) % 7; // Calculate days until that day this week
        const thisWeekDay = new Date(today);
        thisWeekDay.setDate(today.getDate() + targetDay);
        return thisWeekDay;
      }
    }

    // Check for exact dates, e.g., "November 15" or "15 November"
    const exactDateMatch = inputText.match(/\b(\d{1,2})[a-z]{0,2}\s+(january|february|march|april|may|june|july|august|september|october|november|december)/);
    if (exactDateMatch) {
      const day = parseInt(exactDateMatch[1], 10);
      const month = new Date(`${exactDateMatch[2]} 1`).getMonth();
      const year = today.getFullYear();
      return new Date(year, month, day);
    }

    return null; // Return null if no date was recognized
  };

  const createTransaction = () => {
    if (Number.isNaN(Number(formData.amount)) || !formData.date.includes('-')) return;
    addTransaction({ ...formData, amount: Number(formData.amount), id: uuidv4() });
    setOpen(true);
    setFormData(initialState);
  };

  return (
    <Grid container spacing={2}>
      <Snackbar open={open} setOpen={setOpen} />
      <Grid item xs={12}>
        <Typography align="center" variant="subtitle2" gutterBottom>
          
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            inputRef={typeRef}
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          >
            <MenuItem value="Income">Income</MenuItem>
            <MenuItem value="Expense">Expense</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            inputRef={categoryRef}
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {(formData.type === 'Income' ? incomeCategories : expenseCategories).map((c) => (
              <MenuItem key={c.type} value={c.type}>
                {c.type}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <TextField
          inputRef={amountRef}
          type="number"
          label="Amount"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          fullWidth
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          inputRef={dateRef}
          fullWidth
          label="Date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: formatDate(e.target.value) })}
        />
      </Grid>
      <Grid item xs={12} style={{ marginBottom: '0.5px' }}>
        <Button variant="contained" color="primary" fullWidth onClick={startListening}>
          Record Transaction
        </Button>
      </Grid>
      <Grid item xs={12} style={{ marginTop: '2px' }}>
        <Button className={classes.button} variant="outlined" color="primary" fullWidth onClick={createTransaction}>
          Create
        </Button>
      </Grid>
    </Grid>
  );
};

export default NewTransactionForm;
