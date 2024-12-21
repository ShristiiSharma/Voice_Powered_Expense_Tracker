import React, { useState, useContext } from "react";
import {
  List as MUIList,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Slide,
  TextField,
  Button,
} from "@material-ui/core";
import { Delete, MoneyOff } from "@material-ui/icons";
import { ExpenseTrackerContext } from "../../../context/context";
import useStyles from "./styles";
import formatDate from "../../../utils/formatDate";

const List = () => {
  const classes = useStyles();
  const { transactions, deleteTransaction } = useContext(ExpenseTrackerContext);
  const [selectedDate, setSelectedDate] = useState("");
  const [filteredTransactions, setFilteredTransactions] = useState(transactions);

  // Filter transactions based on the selected date
  const filterTransactionsByDate = () => {
    if (selectedDate) {
      const filtered = transactions.filter(
        (transaction) => transaction.date === formatDate(new Date(selectedDate))
      );
      setFilteredTransactions(filtered);
    } else {
      setFilteredTransactions(transactions); // Show all if no date is selected
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <div>
      <TextField
        type="date"
        //label="Search history by date"
        fullWidth
        value={selectedDate}
        onChange={handleDateChange}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={filterTransactionsByDate}
        fullWidth
      >
        Filter History by Date
      </Button>

      <MUIList dense={false} className={classes.list}>
        {filteredTransactions.map((transaction) => (
          <Slide
            direction="down"
            in
            mountOnEnter
            unmountOnExit
            key={transaction.id}
          >
            <ListItem>
              <ListItemAvatar>
                <Avatar
                  className={
                    transaction.type === "Income"
                      ? classes.avatarIncome
                      : classes.avatarExpense
                  }
                >
                  <MoneyOff />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={transaction.category}
                secondary={`$${transaction.amount} - ${transaction.date}`}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => deleteTransaction(transaction.id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Slide>
        ))}
      </MUIList>
    </div>
  );
};

export default List;
