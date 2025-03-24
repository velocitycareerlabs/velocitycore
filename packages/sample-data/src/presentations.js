/**
 * Copyright 2023 Velocity Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable max-len */
const genericSelfSignedPresentation =
  'eyJ0eXAiOiJKV1QiLCJqd2siOnsia3R5IjoiRUMiLCJjcnYiOiJzZWNwMjU2azEiLCJ4IjoiSnM0WTBNUVUvN1czM3E0OFd0c1FCdkdRT3N2OUcwTGp2RWtrOU1iL080TT0iLCJ5IjoiQ05PeUMxY09mcmxYSlVvVmdjalhrM0lSNllGdnZWWjZHSzlmb2c1Q1VLdz0ifSwiYWxnIjoiRVMyNTZLIn0.eyJpZCI6InVpZF8xNTk3NjYzNjQzNjM1XzEiLCJ2ZXJpZmlhYmxlQ3JlZGVudGlhbCI6WyJleUowZVhBaU9pSktWMVFpTENKcWQyc2lPbnNpYTNSNUlqb2lSVU1pTENKamNuWWlPaUp6WldOd01qVTJhekVpTENKNElqb2lTWGR1YldwUU1VZHBWVUpwZVRkbVVtUnVhbGg2TVRKSUwwZGlVVnBxYlZGVlVUUmhZbXR6T1hsbE5EMGlMQ0o1SWpvaVowVjNNRGRaTUUxU1pGa3dXbGxXTlZVelpGQTRWRXhHT1c1U2VXNTBkMlUzYUZNNU1GbG9iV2RtUVQwaWZTd2lZV3huSWpvaVJWTXlOVFpMSW4wLmV5SnpkV0lpT2lKa2FXUTZaWFJvY2k0d2VHUmpabUkxT1dVek9UaG1aV0kzWWpVeE9HWTFObU5rWTJRM09UaG1PV00xTkRrek1XWmpOelFpTENKMll5STZleUpBWTI5dWRHVjRkQ0k2V3lKb2RIUndjem92TDNkM2R5NTNNeTV2Y21jdk1qQXhPQzlqY21Wa1pXNTBhV0ZzY3k5Mk1TSmRMQ0pwWkNJNkltUnBaRHBsZEdoeUxqQjRaR05tWWpVNVpUTTVPR1psWWpkaU5URTRaalUyWTJSalpEYzVPR1k1WXpVME9UTXhabU0zTkNJc0luUjVjR1VpT2xzaVNXUmxiblJwZEhsQmJtUkRiMjUwWVdOMElpd2lWbVZ5YVdacFlXSnNaVU55WldSbGJuUnBZV3dpWFN3aWFYTnpkV1Z5SWpvaVpHbGtPbVYwYUhJdU1IZ3dZakUxTkdSaE5EaGtNR1l5TVROak1qWmpOR0l4WkRBME1HUmpOV1ptTVdSaVpqazVabVpoSWl3aWFYTnpkV0Z1WTJWRVlYUmxJam9pTWpBeU1DMHdPQzB4TjFReE1Ub3lOam95TXk0NE5EQmFJaXdpWTNKbFpHVnVkR2xoYkZOMVltcGxZM1FpT25zaVptbHljM1JPWVcxbElqcDdJbXh2WTJGc2FYcGxaQ0k2ZXlKbGJpSTZJa0ZrWVcwaWZYMHNJbXhoYzNST1lXMWxJanA3SW14dlkyRnNhWHBsWkNJNmV5SmxiaUk2SWxOdGFYUm9JbjE5TENKbGJXRnBiQ0k2SW1Ga1lXMHVjMjFwZEdoQVpYaGhiWEJzWlM1amIyMGlMQ0p3YUc5dVpTSTZJaXN4SURVMU5TQTJNVGtnTWpFNU1TSXNJbVJ2WWlJNmV5SmtZWGtpT2pNc0ltMXZiblJvSWpvekxDSjVaV0Z5SWpveE9UY3hmU3dpYkc5allYUnBiMjRpT25zaVkyOTFiblJ5ZVVOdlpHVWlPaUpWVXlJc0luSmxaMmx2YmtOdlpHVWlPaUpEUVNKOUxDSnBaR1Z1ZEdsMGVVNTFiV0psY2lJNmV5SnJhVzVrSWpvaVJISnBkbVZ5YzB4cFkyVnVjMlVpTENKMllXeDFaU0k2SWpFeU16RXdNekV5TXpFeUluMHNJbUZrWkhKbGMzTWlPbnNpYkdsdVpURWlPaUkwTURBZ1FtVnNiQ0JUZENJc0lteHBibVV5SWpvaVJXRnpkQ0JRWVd4dklFRnNkRzhpTENKd2IzTjBZMjlrWlNJNklqazBNekF6SWl3aWNtVm5hVzl1UTI5a1pTSTZJa05CSWl3aVkyOTFiblJ5ZVVOdlpHVWlPaUpWVXlKOWZTd2lZM0psWkdWdWRHbGhiRk4wWVhSMWN5STZleUpwWkNJNkltaDBkSEJ6T2k4dlkzSmxaR1Z1ZEdsaGJITjBZWFIxY3k1MlpXeHZZMmwwZVdOaGNtVmxjbXhoWW5NdWFXOGlMQ0owZVhCbElqb2lWbVZzYjJOcGRIbFNaWFp2WTJGMGFXOXVVbVZuYVhOMGNua2lmWDBzSW1semN5STZJbVJwWkRwbGRHaHlMakI0TUdJeE5UUmtZVFE0WkRCbU1qRXpZekkyWXpSaU1XUXdOREJrWXpWbVpqRmtZbVk1T1dabVlTSXNJbWxoZENJNk1UVTVOelkyTXpVNE0zMC45N3JRQVp2Q3pGaEp1aGVlaE9YRmN2a3pUal84S2pRR0ZUQUhjTVFSQ1loSkJNamlVRjhibF92WGpodjFmUFJxWUhLcTBQZlEtNmJDR2swZ2poS3BPUSIsImV5SjBlWEFpT2lKS1YxUWlMQ0pxZDJzaU9uc2lhM1I1SWpvaVJVTWlMQ0pqY25ZaU9pSnpaV053TWpVMmF6RWlMQ0o0SWpvaWVIZExkblZHZVV0bmNFWnNVazV0VkV4SFZqaHpXR3BxUVV0RldscERSWGxhYVNzMVNrVTBjRFZpVFQwaUxDSjVJam9pVHpNclJVbDBjVTFNZFdkVWMyWlBhR3hoTW1aR2NGQkllRU5qY0ZWTWNtWmFVVlJSTldSa2NUQkZORDBpZlN3aVlXeG5Jam9pUlZNeU5UWkxJbjAuZXlKemRXSWlPaUprYVdRNlpYUm9jaTR3ZURNMU9HWTJPVFJtTkdKaE5XWXdNR014TldZM1pUa3laV05qTTJVMFkyTmhZemRqWVRWbU1EQWlMQ0oyWXlJNmV5SkFZMjl1ZEdWNGRDSTZXeUpvZEhSd2N6b3ZMM2QzZHk1M015NXZjbWN2TWpBeE9DOWpjbVZrWlc1MGFXRnNjeTkyTVNKZExDSnBaQ0k2SW1ScFpEcGxkR2h5TGpCNE16VTRaalk1TkdZMFltRTFaakF3WXpFMVpqZGxPVEpsWTJNelpUUmpZMkZqTjJOaE5XWXdNQ0lzSW5SNWNHVWlPbHNpUTNWeWNtVnVkRVZ0Y0d4dmVXMWxiblJRYjNOcGRHbHZiaUlzSWxabGNtbG1hV0ZpYkdWRGNtVmtaVzUwYVdGc0lsMHNJbWx6YzNWbGNpSTZJbVJwWkRwbGRHaHlMakI0TUdJeE5UUmtZVFE0WkRCbU1qRXpZekkyWXpSaU1XUXdOREJrWXpWbVpqRmtZbVk1T1dabVlTSXNJbWx6YzNWaGJtTmxSR0YwWlNJNklqSXdNakF0TURndE1UZFVNVEU2TWpZNk5Ea3VPRGs1V2lJc0ltTnlaV1JsYm5ScFlXeFRkV0pxWldOMElqcDdJbU52YlhCaGJua2lPaUprYVdRNlpYUm9janBwWVcxaGJtbHpjM1ZsY2pFeU16UTFOamM0T1RBaUxDSmpiMjF3WVc1NVRtRnRaU0k2ZXlKc2IyTmhiR2w2WldRaU9uc2laVzRpT2lKQlEwMUZJRU52Y25CdmNtRjBhVzl1SW4xOUxDSjBhWFJzWlNJNmV5SnNiMk5oYkdsNlpXUWlPbnNpWlc0aU9pSlFjbTluY21GdGJXVWdUV0Z1WVdkbGNpSjlmU3dpYzNSaGNuUk5iMjUwYUZsbFlYSWlPbnNpYlc5dWRHZ2lPaklzSW5sbFlYSWlPakl3TVRWOUxDSnNiMk5oZEdsdmJpSTZleUpqYjNWdWRISjVRMjlrWlNJNklsVlRJaXdpY21WbmFXOXVRMjlrWlNJNklrTkJJbjBzSW1SbGMyTnlhWEIwYVc5dUlqb2lVbVZ6Y0c5dWMybGliR1VnWm05eUlHUnBaMmwwWVd3Z2RISmhibk5tYjNKdFlYUnBiMjRnY0c5eWRHWnZiR2x2SUdGMElFRkRUVVVnUTI5eWNHOXlZWFJwYjI0aWZTd2lZM0psWkdWdWRHbGhiRk4wWVhSMWN5STZleUpwWkNJNkltaDBkSEJ6T2k4dlkzSmxaR1Z1ZEdsaGJITjBZWFIxY3k1MlpXeHZZMmwwZVdOaGNtVmxjbXhoWW5NdWFXOGlMQ0owZVhCbElqb2lWbVZzYjJOcGRIbFNaWFp2WTJGMGFXOXVVbVZuYVhOMGNua2lmWDBzSW1semN5STZJbVJwWkRwbGRHaHlMakI0TUdJeE5UUmtZVFE0WkRCbU1qRXpZekkyWXpSaU1XUXdOREJrWXpWbVpqRmtZbVk1T1dabVlTSXNJbWxoZENJNk1UVTVOelkyTXpZd09YMC5wSzA5T3d0SkFtQk1Eb1BPTTdNMXVpTWJiemUxdlh5NlE4S3RjSDkwblJYSDQwNFdkcGR2X25pRGNUVWlFaWZzc09TZVFMN0xTR0tyQklBNHF5LVpldyIsImV5SjBlWEFpT2lKS1YxUWlMQ0pxZDJzaU9uc2lhM1I1SWpvaVJVTWlMQ0pqY25ZaU9pSnpaV053TWpVMmF6RWlMQ0o0SWpvaVoySjJhelZGUVUxRE5rTmxNSGRFVVRSMmVESjFNMlo1WmtseE5GWlJlR3B5Vm5BelRGRnpLelk1VVQwaUxDSjVJam9pZFcxSVF6VXlUWEpSTURnM09YaFRiSFl5VGxCYVQzUnFZVGhuWmxOSk1FVjRWR3hNWjNadWJsTkJSVDBpZlN3aVlXeG5Jam9pUlZNeU5UWkxJbjAuZXlKemRXSWlPaUprYVdRNlpYUm9jaTR3ZURCaE5qTmpNVGhrTURsa05UUXpNRE0yTTJJeVpqTmlNamN3TmprNFlUWTNOMlppTlRFelpUUWlMQ0oyWXlJNmV5SkFZMjl1ZEdWNGRDSTZXeUpvZEhSd2N6b3ZMM2QzZHk1M015NXZjbWN2TWpBeE9DOWpjbVZrWlc1MGFXRnNjeTkyTVNKZExDSnBaQ0k2SW1ScFpEcGxkR2h5TGpCNE1HRTJNMk14T0dRd09XUTFORE13TXpZellqSm1NMkl5TnpBMk9UaGhOamMzWm1JMU1UTmxOQ0lzSW5SNWNHVWlPbHNpUldSMVkyRjBhVzl1UkdWbmNtVmxJaXdpVm1WeWFXWnBZV0pzWlVOeVpXUmxiblJwWVd3aVhTd2lhWE56ZFdWeUlqb2laR2xrT21WMGFISXVNSGd3WWpFMU5HUmhORGhrTUdZeU1UTmpNalpqTkdJeFpEQTBNR1JqTldabU1XUmlaams1Wm1aaElpd2lhWE56ZFdGdVkyVkVZWFJsSWpvaU1qQXlNQzB3T0MweE4xUXhNVG95Tnpvd05pNDNOekphSWl3aVkzSmxaR1Z1ZEdsaGJGTjFZbXBsWTNRaU9uc2ljMk5vYjI5c0lqb2laR2xrT21WMGFISTZhV0Z0WVc1cGMzTjFaWEk1T0RjMk5UUXpNakV3SWl3aWMyTm9iMjlzVG1GdFpTSTZleUpzYjJOaGJHbDZaV1FpT25zaVpXNGlPaUpDUVZORklGVnVhWFpsY21sMGVTSjlmU3dpWkdWbmNtVmxUbUZ0WlNJNmV5SnNiMk5oYkdsNlpXUWlPbnNpWlc0aU9pSkNZV05vWld4dmNpSjlmU3dpY0hKdlozSmhiU0k2ZXlKc2IyTmhiR2w2WldRaU9uc2laVzRpT2lKRGIyMXdkWFJsY2lCVFkybGxibU5sSW4xOUxDSnpkR0Z5ZEUxdmJuUm9XV1ZoY2lJNmV5SnRiMjUwYUNJNk9Td2llV1ZoY2lJNk1qQXdNbjBzSW1WdVpFMXZiblJvV1dWaGNpSTZleUp0YjI1MGFDSTZOU3dpZVdWaGNpSTZNakF3TlgxOUxDSmpjbVZrWlc1MGFXRnNVM1JoZEhWeklqcDdJbWxrSWpvaWFIUjBjSE02THk5amNtVmtaVzUwYVdGc2MzUmhkSFZ6TG5abGJHOWphWFI1WTJGeVpXVnliR0ZpY3k1cGJ5SXNJblI1Y0dVaU9pSldaV3h2WTJsMGVWSmxkbTlqWVhScGIyNVNaV2RwYzNSeWVTSjlmU3dpYVhOeklqb2laR2xrT21WMGFISXVNSGd3WWpFMU5HUmhORGhrTUdZeU1UTmpNalpqTkdJeFpEQTBNR1JqTldabU1XUmlaams1Wm1aaElpd2lhV0YwSWpveE5UazNOall6TmpJMmZRLmlwRVJBdE1RYjh5ek52YVAzdmRmT1d3bldHc0Y3VmV3WnB0cGtFR2hmZ240UmhnenM5dHMtNmZQSWJvaGx3bkllT0w0MTNBY1JmWThPd0E2WE9ER2R3Il0sImlzcyI6ImRpZDpldGhyLjB4MGIxNTRkYTQ4ZDBmMjEzYzI2YzRiMWQwNDBkYzVmZjFkYmY5OWZmYSIsImlhdCI6MTU5NzY2MzY0M30.hyo2lGLuN_VLvKYSvPbpPqpgaFhYO4W_J3ZBisb6sSc8FK8BxJZlePFq9-n-wjpfKukYSn_Q8MULzlbKenSGtw';

module.exports = {
  genericSelfSignedPresentation,
};
