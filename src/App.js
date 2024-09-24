import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fakerEN_US, fakerRU, fakerKA_GE } from '@faker-js/faker';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Parser } from 'json2csv';

const App = () => {
  const [region, setRegion] = useState('en_US');
  const [data, setData] = useState([]);
  const [errorCount, setErrorCount] = useState(0);
  const [seed, setSeed] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const tableRef = useRef(null);

  const applyRandomError = (str) => {
    const errors = [
      (s) => {
        const pos = Math.floor(Math.random() * s.length);
        return s.slice(0, pos) + s.slice(pos + 1); // Удаление символа
      },
      (s) => {
        const charToAdd = String.fromCharCode(Math.floor(Math.random() * 26) + 97); // Добавление случайного символа
        const pos = Math.floor(Math.random() * (s.length + 1));
        return s.slice(0, pos) + charToAdd + s.slice(pos);
      },
      (s) => {
        const pos = Math.floor(Math.random() * (s.length - 1));
        return s.slice(0, pos) + s.charAt(pos + 1) + s.charAt(pos) + s.slice(pos + 2); // Перестановка символов
      }
    ];

    const errorFunc = errors[Math.floor(Math.random() * errors.length)];
    return errorFunc(str);
  };

  const generateFakeData = useCallback(() => {
    if (seed) fakerEN_US.seed(parseInt(seed) + page);
    const generatedData = [];
    let faker;

    switch (region) {
      case 'ru_RU':
        faker = fakerRU;
        break;
      case 'ka_GE':
        faker = fakerKA_GE;
        break;
      default:
        faker = fakerEN_US;
    }

    for (let i = 0; i < 20; i++) {
      const gender = Math.random() < 0.5 ? 'male' : 'female';
      const firstName = gender === 'male' ? faker.person.firstName("male") : faker.person.firstName("female");
      const lastName = gender === 'male' ? faker.person.lastName("male") : faker.person.lastName("female");
      const person = `${firstName} ${lastName}`;

      let location;
      switch (region) {
        case 'ru_RU':
          const street = faker.location.street();
          const house = faker.string.numeric(2);
          const apartment = faker.string.numeric(3);
          location = `${faker.location.city()}, ${street}, д. ${house}, кв. ${apartment}`;
          break;
        case 'ka_GE':
          location = `${faker.location.city()}, ${faker.location.streetAddress()}`;
          break;
        default:
          location = `${faker.location.streetAddress()}, ${faker.location.city()}`;
      }

      const errors = Math.floor(errorCount);
      let personWithErrors = person;
      for (let j = 0; j < errors; j++) {
        personWithErrors = applyRandomError(personWithErrors);
      }

      generatedData.push({
        id: faker.string.uuid(),
        person: personWithErrors,
        location,
        phone: region === 'ru_RU' ? faker.phone.number('7##########') : region === 'ka_GE' ? faker.phone.number('9955########') : faker.phone.number(),
        errors: errors,
      });
    }

    setData((prevData) => [...prevData, ...generatedData]);
    setLoading(false);
  }, [region, errorCount, seed, page]);

  useEffect(() => {
    generateFakeData(); // Генерация данных при первом входе
  }, [generateFakeData]);

  useEffect(() => {
    if (loading) {
      generateFakeData();
    }
  }, [loading, generateFakeData]);

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
      setLoading(true);
      setPage((prevPage) => prevPage + 1);
    }
  };

  const handleRegionChange = (event) => {
    setRegion(event.target.value);
    setData([]); // Сброс данных
    setPage(1); // Сброс страницы
  };

  const handleErrorCountChange = (event) => {
    const value = parseFloat(event.target.value);
    setErrorCount(value);
    setData([]); // Сброс данных
    setPage(1); // Сброс страницы
  };

  const handleSeedChange = (event) => {
    setSeed(event.target.value);
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000));
  };

  const exportToCSV = () => {
    try {
      const parser = new Parser();
      const csv = parser.parse(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'data.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Ошибка при экспорте данных:', error);
    }
  };

  return (
    <div className="container mt-3">
      <h1 className="text-center">Генератор фейковых данных</h1>
      <div className="d-flex align-items-center mb-3">
        <label className="form-label me-2">Регион:</label>
        <select className="form-select me-3" value={region} onChange={handleRegionChange}>
          <option value="en_US">США</option>
          <option value="ru_RU">Россия</option>
          <option value="ka_GE">Грузия</option>
        </select>
      </div>

      <div className="d-flex align-items-center mb-3">
        <label className="form-label me-2">Количество ошибок:</label>
        <input
          type="range"
          min="0"
          max="10"
          step="0.25"
          value={errorCount}
          onChange={handleErrorCountChange}
          className="me-2"
        />
        <input
          type="number"
          className="form-control mt-2 me-2"
          min="0"
          max="1000"
          step="0.25"
          value={errorCount}
          onChange={handleErrorCountChange}
        />
      </div>

      <div className="d-flex align-items-center mb-3">
        <label className="form-label me-2">Сид:</label>
        <input
          type="number"
          className="form-control me-2"
          value={seed}
          onChange={handleSeedChange}
        />
        <button className="btn btn-secondary mt-2" onClick={generateRandomSeed}>
          Сгенерировать сид
        </button>
      </div>

      <button className="btn btn-primary" onClick={generateFakeData}>
        Сгенерировать данные
      </button>

      <div ref={tableRef} className="table-responsive" onScroll={handleScroll} style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ddd', marginTop: '20px' }}>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Имя</th>
              <th>Адрес</th>
              <th>Телефон</th>
              <th>Ошибки</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.person}</td>
                <td>{item.location}</td>
                <td>{item.phone}</td>
                <td>{item.errors}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div>Загрузка...</div>}
      </div>

      <button className="btn btn-success mt-3" onClick={exportToCSV}>
        Экспорт в CSV
      </button>
    </div>
  );
};

export default App;
