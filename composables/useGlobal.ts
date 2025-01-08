import { type UUIDTypes } from 'uuid';

export const useGlobal = () => {
  const isOpen_createAnimationModal = useState('isOpen_createAnimationModal', () => false);
  const isOpen_createFlashPointModal = useState('isOpen_createFlashPointModal', () => false);

  const currentNodeId = useState<UUIDTypes | null>('currentNodeId', () => null);
  const currentActiveAnimationId = useState<string | null>('currentActiveAnimationId', () => null);
  const currentActiveFlashPointId = useState<string | null>(
    'currentActiveFlashPointId',
    () => null
  );
  const TOTAL_DURATION = 12;
  return {
    // state
    TOTAL_DURATION,
    isOpen_createAnimationModal,
    isOpen_createFlashPointModal,
    currentNodeId,
    currentActiveAnimationId,
    currentActiveFlashPointId
  };
};
