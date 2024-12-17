import React, { useEffect, useState } from 'react';

const ReceiptTable = ({ items, setItems, people, setPeople }) => {
  const [participations, setParticipations] = useState([]);
  const [tax, setTax] = useState(0);
  const [tip, setTip] = useState(0);
  const [newPerson, setNewPerson] = useState('');

  // For editing person name
  const [editingPersonIndex, setEditingPersonIndex] = useState(null);
  const [editingPersonName, setEditingPersonName] = useState('');

  useEffect(() => {
    // Sync participations size with items and people
    if (participations.length < items.length) {
      const diff = items.length - participations.length;
      for (let i = 0; i < diff; i++) {
        setParticipations(prev => [...prev, people.map(() => false)]);
      }
    } else if (participations.length > items.length) {
      setParticipations(prev => prev.slice(0, items.length));
    }

    if (participations[0] && participations[0].length < people.length) {
      const diff = people.length - participations[0].length;
      if (diff > 0) {
        setParticipations(prev => prev.map(row => [...row, ...Array(diff).fill(false)]));
      }
    } else if (participations[0] && participations[0].length > people.length) {
      setParticipations(prev => prev.map(row => row.slice(0, people.length)));
    }
  }, [people, items, participations]);

  const handleToggleParticipation = (itemIndex, personIndex) => {
    setParticipations(prev => prev.map((row, i) => {
      if (i === itemIndex) {
        return row.map((val, j) => (j === personIndex ? !val : val));
      }
      return row;
    }));
  };

  const handleItemNameChange = (index, value) => {
    const updatedItems = [...items];
    updatedItems[index].name = value;
    setItems(updatedItems);
  };

  const handleItemPriceChange = (index, value) => {
    const updatedItems = [...items];
    updatedItems[index].price = parseFloat(value) || 0;
    setItems(updatedItems);
  };

  const addItem = () => {
    setItems([...items, { name: 'New Item', price: 0 }]);
  };

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addPerson = () => {
    if (newPerson.trim() !== '') {
      setPeople([...people, newPerson.trim()]);
      setNewPerson('');
    }
  };

  const removePerson = (pIndex) => {
    setPeople(people.filter((_, i) => i !== pIndex));
    if (editingPersonIndex === pIndex) {
      setEditingPersonIndex(null);
      setEditingPersonName('');
    }
  };

  const startEditingPerson = (pIndex) => {
    setEditingPersonIndex(pIndex);
    setEditingPersonName(people[pIndex]);
  };

  const stopEditingPerson = () => {
    if (editingPersonName.trim() === '') {
      setEditingPersonName(people[editingPersonIndex]);
    } else {
      const updatedPeople = [...people];
      updatedPeople[editingPersonIndex] = editingPersonName.trim();
      setPeople(updatedPeople);
    }
    setEditingPersonIndex(null);
    setEditingPersonName('');
  };

  const handlePersonNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      stopEditingPerson();
    }
  };

  // Compute allocations
  const itemAllocations = items.map((item, i) => {
    const row = participations[i] || [];
    const count = row.filter(Boolean).length;
    const perPerson = count > 0 ? item.price / count : 0;
    return row.map(selected => (selected ? perPerson : 0));
  });

  const personTotalsFromItems = people.map((_, j) => {
    let sum = 0;
    itemAllocations.forEach(row => {
      sum += row[j] || 0;
    });
    return sum;
  });

  const subtotal = personTotalsFromItems.reduce((acc, val) => acc + val, 0);
  const totalItems = subtotal;
  const totalCost = totalItems + parseFloat(tax || 0) + parseFloat(tip || 0);

  let finalPersonTotals = [...personTotalsFromItems];
  if (totalItems > 0) {
    finalPersonTotals = personTotalsFromItems.map(personTotal => {
      const fraction = personTotal / totalItems;
      const personShareOfTax = fraction * parseFloat(tax || 0);
      const personShareOfTip = fraction * parseFloat(tip || 0);
      return personTotal + personShareOfTax + personShareOfTip;
    });
  }

  return (
    <div>
      <div className="add-section">
        <button onClick={addItem}>Add Item</button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>$</th>
              {people.map((person, pIndex) => (
                <th key={pIndex}>
                  {editingPersonIndex === pIndex ? (
                    <input
                      type="text"
                      value={editingPersonName}
                      onChange={(e) => setEditingPersonName(e.target.value)}
                      onBlur={stopEditingPerson}
                      onKeyDown={handlePersonNameKeyDown}
                      autoFocus
                      style={{ width: '100%', padding: '5px' }}
                    />
                  ) : (
                    <span className="person-name-container">
                      {person}
                      <button 
                        className="edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditingPerson(pIndex);
                        }}
                        title="Edit Person Name"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={(e) => {e.stopPropagation(); removePerson(pIndex);}} 
                        style={{ marginLeft: '5px', fontSize: '0.8em', background: 'none', border: 'none', color: '#333', cursor: 'pointer' }}
                        title="Remove Person"
                      >
                        ✖
                      </button>
                    </span>
                  )}
                </th>
              ))}
              <th>Remove Item</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              return (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemNameChange(i, e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleItemPriceChange(i, e.target.value)}
                    />
                  </td>
                  {people.map((_, j) => {
                    const selected = participations[i] && participations[i][j];
                    const perPersonCost = itemAllocations[i] ? itemAllocations[i][j] : 0;
                    return (
                      <td
                        key={j}
                        className="person-cell"
                        style={{
                          backgroundColor: selected ? '#c8e6c9' : 'transparent'
                        }}
                        onClick={() => handleToggleParticipation(i, j)}
                        title="Click to toggle"
                      >
                        {selected && perPersonCost > 0 ? (
                          <span className="indicator" role="img" aria-label="checked">✅ {perPersonCost.toFixed(2)}</span>
                        ) : (
                          <span className="indicator" role="img" aria-label="unchecked">✖</span>
                        )}
                      </td>
                    );
                  })}
                  <td>
                    <button 
                      style={{ background: '#ff5555', color: '#fff', border: 'none', borderRadius: '4px', padding: '5px 10px' }}
                      onClick={() => removeItem(i)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Subtotal (Items):</td>
              <td colSpan={people.length + 1} style={{ textAlign: 'right' }}>
                {subtotal.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Tax:</td>
              <td colSpan={people.length + 1} style={{ textAlign: 'right' }}>
                <input
                  type="number"
                  step="0.01"
                  value={tax}
                  onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                  style={{ width: '80px', textAlign: 'right' }}
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Tip:</td>
              <td colSpan={people.length + 1} style={{ textAlign: 'right' }}>
                <input
                  type="number"
                  step="0.01"
                  value={tip}
                  onChange={(e) => setTip(parseFloat(e.target.value) || 0)}
                  style={{ width: '80px', textAlign: 'right' }}
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ textAlign: 'right', fontWeight: 'bold' }}>Grand Total:</td>
              <td colSpan={people.length + 1} style={{ textAlign: 'right', fontWeight: 'bold' }}>
                {totalCost.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="add-section">
        <input 
          type="text" 
          placeholder="New person name"
          value={newPerson}
          onChange={(e) => setNewPerson(e.target.value)} 
        />
        <button onClick={addPerson}>Add Person</button>
      </div>

      {people.length > 0 && items.length > 0 && (
        <>
          <h3>Final Totals per Person (including tax & tip):</h3>
          <table className="final-totals-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Amount Due</th>
              </tr>
            </thead>
            <tbody>
              {people.map((person, j) => (
                <tr key={j}>
                  <td>{person}</td>
                  <td style={{ textAlign: 'right' }}>
                    {finalPersonTotals[j] ? finalPersonTotals[j].toFixed(2) : '0.00'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
};

export default ReceiptTable;
