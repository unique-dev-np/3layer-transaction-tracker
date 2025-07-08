
import styled from 'styled-components';

export const Card = styled.div`
  background: var(--card-background);
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-color);
`;

export const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  background-color: var(--input-background);
  color: var(--text-color);

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

export const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  appearance: none;
  background-color: var(--input-background);
  color: var(--text-color);
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;


  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
  }
`;

export const Button = styled.button`
  background: var(--button-primary-bg);
  color: var(--button-primary-text);
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
  font-weight: 500;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: var(--secondary-color);
  }

  &.delete {
    background: var(--button-delete-bg);
    &:hover {
        background: #dc2626;
    }
  }
`;

export const FormGroup = styled.div`
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;

    label {
        margin-bottom: 0.5rem;
    }
`;
