import { type UUIDTypes } from 'uuid';

export const useGlobal = () => {
  const isOpen_createAnimationModal = useState('isOpen_createAnimationModal', () => false);

  const currentNodeId = useState<UUIDTypes | null>('currentNodeId', () => null);
  const currentActiveAnimationId = useState<string | null>('currentActiveAnimationId', () => null);
  return {
    // state
    isOpen_createAnimationModal,
    currentNodeId,
    currentActiveAnimationId
  };
};
