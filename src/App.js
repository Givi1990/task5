import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fakerEN_US, fakerRU, fakerKA_GE } from '@faker-js/faker';
import 'bootstrap/dist/css/bootstrap.min.css';

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
      (s) => s.slice(0, Math.floor(Math.random() * s.length)) + s.slice(Math.floor(Math.random() * s.length) + 1),
      (s) => {
        const charToAdd = String.fromCharCode(Math.floor(Math.random() * 26) + 97);
        const pos = Math.floor(Math.random() * (s.length + 1));
        return s.slice(0, pos) + charToAdd + s.slice(pos);
      },
      (s) => {
        const pos = Math.floor(Math.random() * (s.length - 1));
        return s.slice(0, pos) + s.charAt(pos + 1) + s.charAt(pos) + s.slice(pos + 2);
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

      const errors = Math.floor(Math.random() * (errorCount + 1));
      const personWithErrors = Array.from({ length: errors }, () => applyRandomError(person)).reduce((acc, curr) => curr, person);
      generatedData.push({
        id: faker.string.uuid(),
        person: personWithErrors,
        location,
        phone: region === 'ru_RU' ? faker.phone.number('7##########') : region === 'ka_GE' ? faker.phone.number('9955########') : faker.phone.number(),
        errors,
      });
    }

    setData(generatedData);
    setLoading(false);
  }, [region, errorCount, seed, page]); // Добавлены все необходимые зависимости

  useEffect(() => {
    setLoading(true);
    generateFakeData();
  }, [generateFakeData]); // Теперь только generateFakeData как зависимость

  const handleScroll = () => {
    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 5 && !loading) {
      setLoading(true);
      setPage(prevPage => prevPage + 1);
    }
  };

  const handleRegionChange = (event) => {
    setRegion(event.target.value);
    setData([]);
    setPage(1);
  };

  const handleErrorCountChange = (event) => {
    const value = parseFloat(event.target.value);
    setErrorCount(value);
    setData([]);
    setPage(1);
  };

  const handleSeedChange = (event) => {
    setSeed(event.target.value);
  };

  const generateRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000));
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center">Генератор фейковых данных</h1>
      <div className="mb-3">
        <label className="form-label">Регион:</label>
        <select className="form-select" value={region} onChange={handleRegionChange}>
          <option value="en_US">США</option>
          <option value="ru_RU">Россия</option>
          <option value="ka_GE">Грузия</option>
        </select>
      </div>

      <div className="mb-3">
        <label className="form-label">Количество ошибок:</label>
        <input
          type="range"
          min="0"
          max="10"
          step="1"
          value={errorCount}
          onChange={handleErrorCountChange}
          className="form-range"
        />
        <span>{errorCount}</span>
        <input
          type="number"
          className="form-control mt-2"
          min="0"
          max="1000"
          step="1"
          value={errorCount}
          onChange={handleErrorCountChange}
          placeholder="Введите количество ошибок"
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Seed:</label>
        <div className="input-group">
          <input
            type="number"
            className="form-control"
            value={seed}
            onChange={handleSeedChange}
            placeholder="Введите seed"
          />
          <button className="btn btn-secondary" onClick={generateRandomSeed}>
            Случайный
          </button>
        </div>
      </div>

      <div ref={tableRef} onScroll={handleScroll} style={{ maxHeight: '400px', overflowY: 'auto' }}>
        <table className="table table-striped">
          <thead className="table-dark">
            <tr>
              <th>Номер</th>
              <th>ID</th>
              <th>Имя</th>
              <th>Адрес</th>
              <th>Телефон</th>
              <th>Ошибки</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.id}</td>
                <td>{item.person}</td>
                <td>{item.location}</td>
                <td>{item.phone}</td>
                <td>{item.errors}</td>
              </tr>
            ))}
            {loading && (
              <tr>
                <td colSpan="6" className="text-center">Загрузка...</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default App;
