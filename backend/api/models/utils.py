"""Utility functions."""

from datetime import datetime
from typing import Any, Callable, Dict, List, Union

import numpy as np


def deep_convert_numpy(
    obj: Any,
) -> Union[int, float, List[Any], Dict[str, Any], str, Any]:
    """
    Recursively convert numpy types to Python native types.

    Parameters
    ----------
    obj : Any
        The object to convert.

    Returns
    -------
    Union[int, float, List[Any], Dict[str, Any], str, Any]
        The converted object.
    """
    conversion_map: Dict[type, Callable[[Any], Any]] = {
        np.integer: int,
        np.floating: float,
        np.ndarray: lambda x: x.tolist(),
        dict: lambda x: {key: deep_convert_numpy(value) for key, value in x.items()},
        list: lambda x: [deep_convert_numpy(item) for item in x],
        datetime: lambda x: x.isoformat(),
    }

    for type_, converter in conversion_map.items():
        if isinstance(obj, type_):
            return converter(obj)
    return obj
