class BaseTranslator:
    def translate_book(self, book):
        raise NotImplementedError

    def close(self):
        pass
